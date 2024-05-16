require("./utils.js");
require('dotenv').config();

const express = require('express');
const app = express();
const path = require('path');
const favicon = require('serve-favicon');

const session = require('express-session');
const MongoStore = require('connect-mongo');
const bcrypt = require('bcrypt');
const Joi = require('joi');
const ejs = require('ejs');
app.set('view engine', 'ejs');

const port = process.env.PORT || 3000;

const saltRounds = 12;
const expireTime = 1 * 60 * 60 * 1000; // one hour expiry time

// Env variables
const mongodb_host = process.env.MONGODB_HOST;
const mongodb_user = process.env.MONGODB_USER;
const mongodb_password = process.env.MONGODB_PASSWORD;
const mongodb_database = process.env.MONGODB_DATABASE;
const mongodb_session_secret = process.env.MONGODB_SESSION_SECRET;

const node_session_secret = process.env.NODE_SESSION_SECRET;

var { database } = include('databaseConnection');
const userCollection = database.db(mongodb_database).collection('users');

// Store sessions in db
var mongoStore = MongoStore.create({
  mongoUrl: `mongodb+srv://${mongodb_user}:${mongodb_password}@${mongodb_host}/sessions`,
  crypto: {
    secret: mongodb_session_secret
  }
})

app.use(favicon(path.join(__dirname, 'public', 'images', 'favicon.ico')));

app.use(express.urlencoded({ extended: false }));

app.use(session({
  secret: node_session_secret,
  store: mongoStore,
  saveUninitialized: false,
  resave: true
}
));

app.use(express.static(__dirname + "/public"));

// Home page ---------------------------
app.get('/', (req, res) => {
  if (req.session.authenticated) {
    res.render("home_logged_in.ejs", { username: req.session.username });
    return;
  }
  res.render("home_logged_out.ejs");
})

// Sign up ----------------------------
app.get('/signup', (req, res) => {
  res.render("sign_up.ejs");
});

// Submit new user to database and validate inputs
app.post('/submitUser', async (req, res) => {
  var username = req.body.username;
  var email = req.body.email;
  var password = req.body.password;
  var securityQuestion = req.body.securityQuestion;
  var securityAnswer = req.body.securityAnswer

  const usernameSchema = Joi.string().max(20).required();
  const emailSchema = Joi.string().max(40).required();
  const passwordSchema = Joi.string().max(20).required();
  const securityAnswerSchema = Joi.string().max(20).required();

  // Username verification
  const usernameValidationResult = usernameSchema.validate(username);
  if (usernameValidationResult.error != null) {
    res.render("invalid_sign_up.ejs", { type: "username" })
    return;
  }

  // Check if username is taken
  if (await userCollection.findOne({ username: usernameValidationResult.value }) != null) {
    res.render("invalid_sign_up.ejs", { type: "username (username is taken)" })
    return;
  }

  // Email verification
  const emailValidationResult = emailSchema.validate(email);
  if (emailValidationResult.error != null) {
    res.render("invalid_sign_up.ejs", { type: "email" })
    return;
  }

  // Password verification
  const passwordValidationResult = passwordSchema.validate(password);
  if (passwordValidationResult.error != null) {
    res.render("invalid_sign_up.ejs", { type: "password" })
    return;
  }

  // Security question answer verification
  const securityAnswerValidationResult = securityAnswerSchema.validate(securityAnswer);
  if (securityAnswerValidationResult.error != null) {
    res.render("invalid_sign_up.ejs", { type: "security answer" })
    return;
  }

  // Hash password
  var hashedPassword = await bcrypt.hash(password, saltRounds);

  // Hash security question answer
  var hashedSecurityAnswer = await bcrypt.hash(securityAnswer, saltRounds);

  // Insert user into collection
  await userCollection.insertOne({
    username: username,
    email: email,
    password: hashedPassword,
    in_game_name: null,
    securityQuestion: securityQuestion,
    securityAnswer: hashedSecurityAnswer,
    tasks: []
  });

  req.session.authenticated = true;
  req.session.username = username;
  res.redirect('/');
});

// Log in page -------------------------------
app.get('/login', (req, res) => {
  res.render("log_in.ejs");
})

// Log in submission and verification
app.post('/loggingin', async (req, res) => {
  var username = req.body.username;
  var password = req.body.password;

  const usernameSchema = Joi.string().max(20).required();
  const passwordSchema = Joi.string().max(20).required();

  // username verification
  const usernameValidationResult = usernameSchema.validate(username);
  if (usernameValidationResult.error != null) {
    res.render("invalid_log_in.ejs", { type: "username" });
    return;
  }

  // Password verification
  const passwordValidationResult = passwordSchema.validate(password);
  if (passwordValidationResult.error != null) {
    res.render("invalid_log_in.ejs", { type: "password" });
    return;
  }

  // Secure database access (user name not input field)
  const result = await userCollection.find({ username: username }).project({ username: 1, email: 1, password: 1, in_game_name: 1, _id: 1 }).toArray();

  // User not found
  console.log(result);
  if (result.length != 1) {
    res.render("invalid_log_in.ejs", { type: "username (user not found)" });
    return;
  }
  // Correct password
  if (await bcrypt.compare(password, result[0].password)) {
    req.session.authenticated = true;
    req.session.username = result[0].username;
    req.session.cookie.maxAge = expireTime;

    res.redirect('/');
    return;
  }
  else {
    res.render("invalid_log_in.ejs", { type: "password" });
    return;
  }
});

app.get('/password_recovery', (req, res) => {
  res.render("password_recovery.ejs");
})

app.post('/security_question', async (req, res) => {
  // Validate username input
  username = req.body.username;
  const usernameSchema = Joi.string().max(20).required();
  const usernameValidationResult = usernameSchema.validate(username);

  if (usernameValidationResult.error != null) {
    res.render("invalid_password_recovery.ejs", { type: "username" });
    return;
  }

  user = await userCollection.findOne(
    {username: username}, 
    {projection: {securityQuestion: 1}});
  securityQuestion = user.securityQuestion;

  // Render security question
  res.render("security_question.ejs", {
    username: username,
    securityQuestion: securityQuestion})
})

app.post('/password_reset', async (req, res) => {
  // Validate new password and security answer input
  newPassword = req.body.newPassword;
  securityAnswer = req.body.securityAnswer;
  username = req.body.username;

  user = await userCollection.findOne(
    {username: username}, 
    {projection: {securityAnswer: 1}});

  const newPasswordSchema = Joi.string().max(20).required();
  const newPasswordValidationResult = newPasswordSchema.validate(newPassword);
  const securityAnswerSchema = Joi.string().max(20).required();
  const securityAnswerValidationResult = securityAnswerSchema.validate(securityAnswer);

  if (newPasswordValidationResult.error != null) {
    res.render("invalid_password_recovery.ejs", { type: "new password" });
    return;
  }

  if (securityAnswerValidationResult.error != null) {
    res.render("invalid_password_recovery.ejs", { type: "security answer" });
    return;
  }

  // Check if security answer matches
  if (await bcrypt.compare(securityAnswer, user.securityAnswer)) {
    // Change password
    hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);
    await userCollection.updateOne(
      {username: username}, 
      {$set: {password: hashedNewPassword}});
      
    res.render("successful_password_recovery.ejs");
    return;
  } else {
    res.render("invalid_password_recovery.ejs", { type: "security answer" });
    return;
  }
})

// Log out
app.get('/logout', async (req, res) => {
  const userCollection = database.db(mongodb_database).collection('users')
  await userCollection.deleteOne({ _id: req.session._id });
  req.session.destroy();
  res.redirect('/');
});

// Game page
app.get('/game', async (req, res) => {
  if (req.session.authenticated) {
    user = await userCollection.findOne(
      {username: req.session.username}, 
      {projection: {tasks: 1}});
    res.render("game.ejs", {tasks: user.tasks});
    return;
  }
  res.redirect("/");
})
// Fitness page
app.get('/fitness', (req, res) => {
  if (req.session.authenticated) {
    res.render("fitness.ejs");
    return;
  }
  res.redirect("/");
})
// Diet page
app.get('/diet', (req, res) => {
  if (req.session.authenticated) {
    res.render("diet.ejs");
    return;
  }
  res.redirect("/");
})
// Friends page
app.get('/friends', (req, res) => {
  if (req.session.authenticated) {
    res.render("friends.ejs");
    return;
  }
  res.redirect("/");
})
// Profile page
app.get('/profile', (req, res) => {
  if (req.session.authenticated) {
    res.render("profile.ejs");
    return;
  }
  res.redirect("/");
})

app.post('/add_task', async (req, res) => {
  newTask = {
    title: req.body.title,
    description: req.body.description,
    category: req.body.category
  }

  await userCollection.updateOne(
    { username: req.session.username },
    { $push: { tasks: newTask } }
  );
  // Redirect to the previous page
  res.redirect(req.get('referer'));
})

// 404 not found page ------------------
app.get("/does_not_exist", (req, res) => {
  res.status(404);
  res.render(`404_not_found.ejs`);
})

app.get("*", (req, res) => {
  res.redirect('/does_not_exist');
})

app.listen(port, () => {
  console.log('Server running on port ' + port);
})