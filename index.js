require("./utils.js");
require('dotenv').config();
const taskFunctions = require("./task_functions.js");
const authenticationFunctions = require("./authentication_functions.js");

const express = require('express');
const app = express();
const path = require('path');
const favicon = require('serve-favicon');

const session = require('express-session');
const MongoStore = require('connect-mongo');
const ejs = require('ejs');
app.set('view engine', 'ejs');

const port = process.env.PORT || 3000;

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

  await authenticationFunctions.submitUser(
    req, res,
    username, userCollection,
    email, password,
    securityQuestion, securityAnswer);
});

// Log in page -------------------------------
app.get('/login', (req, res) => {
  res.render("log_in.ejs");
})

// Log in submission and verification
app.post('/loggingin', async (req, res) => {
  var username = req.body.username;
  var password = req.body.password;

  await authenticationFunctions.logInUser(req, res, username, password, userCollection);
});

app.get('/password_recovery', (req, res) => {
  res.render("password_recovery.ejs");
})

app.post('/security_question', async (req, res) => {
  username = req.body.username;
  await authenticationFunctions.renderSecurityQuestion(req, res, username, userCollection);

  // const usernameSchema = Joi.string().max(20).required();
  // const usernameValidationResult = usernameSchema.validate(username);

  // if (usernameValidationResult.error != null) {
  //   res.render("invalid_password_recovery.ejs", { type: "username" });
  //   return;
  // }

  // user = await userCollection.findOne(
  //   { username: username },
  //   { projection: { securityQuestion: 1 } });
  // securityQuestion = user.securityQuestion;

  // // Render security question
  // res.render("security_question.ejs", {
  //   username: username,
  //   securityQuestion: securityQuestion
  // })
})

app.post('/password_reset', async (req, res) => {
  // Validate new password and security answer input
  username = req.body.username;
  securityAnswer = req.body.securityAnswer;
  newPassword = req.body.newPassword;

  await authenticationFunctions.resetPassword(req, res, username, securityAnswer, newPassword, userCollection);
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
    tasks = await taskFunctions.getTasksByCategory("game", req.session.username, userCollection);
    res.render("game.ejs", { tasks: tasks });
    return;
  }
  res.redirect("/");
})
// Fitness page
app.get('/fitness', async (req, res) => {
  if (req.session.authenticated) {
    tasks = await taskFunctions.getTasksByCategory("fitness", req.session.username, userCollection);
    res.render("fitness.ejs", { tasks: tasks });
    return;
  }
  res.redirect("/");
})
// Diet page
app.get('/diet', async (req, res) => {
  if (req.session.authenticated) {
    tasks = await taskFunctions.getTasksByCategory("diet", req.session.username, userCollection);
    res.render("diet.ejs", { tasks: tasks });
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
// Add task from modal form
app.post('/add_task', async (req, res) => {
  title = req.body.title;
  description = req.body.description;
  category = req.body.category;
  username = req.session.username;

  taskFunctions.addTask(title, description, category, username, userCollection);

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