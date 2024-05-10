require("./utils.js");
require('dotenv').config();

const express = require('express');
const app = express();

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
        res.render("home_logged_in.ejs", {username: req.session.username});
        return;
    }
    res.render("home_logged_out.ejs");
  })

// Sign up ----------------------------
app.get('/signup', (req,res) => {
    res.render("sign_up.ejs");
});

// Submit new user to database and validate inputs
app.post('/submitUser', async (req,res) => {
    var username = req.body.username;
    var email = req.body.email;
    var password = req.body.password;

    const usernameSchema =  Joi.string().max(20).required();
    const emailSchema = Joi.string().max(40).required();
    const passwordSchema =  Joi.string().max(20).required();

    // Username verification
    const usernameValidationResult = usernameSchema.validate(username);
    if (usernameValidationResult.error != null) {
      res.render("invalid_sign_up.ejs", {type: "username"})
      return;
    }
    
    // Email verification
    const emailValidationResult = emailSchema.validate(email);
    if (emailValidationResult.error != null) {
      res.render("invalid_sign_up.ejs", {type: "email"})
      return;
    }

    // Password verification
    const passwordValidationResult = passwordSchema.validate(password);
    if (passwordValidationResult.error != null) {
      res.render("invalid_sign_up.ejs", {type: "password"})
      return;
    }
    
    // Hash password
    var hashedPassword = await bcrypt.hash(password, saltRounds);
	
    // Insert user into collection
    await userCollection.insertOne({username: username, email: email, password: hashedPassword, in_game_name: null});
      req.session.authenticated = true;
      req.session.username = username;
      res.redirect('/');
});

  // Log in page -------------------------------
  app.get('/login', (req, res) => {
    res.render("log_in.ejs");
  })
  
  // Log in submission and verification
  app.post('/loggingin', async (req,res) => {
    var email = req.body.email;
    var password = req.body.password;

    const emailSchema = Joi.string().max(40).required();
    const passwordSchema =  Joi.string().max(20).required();
    
    // Email verification
    const emailValidationResult = emailSchema.validate(email);
    if (emailValidationResult.error != null) {
      res.render("invalid_log_in.ejs", {type: "email"});
      return;
    }

    // Password verification
    const passwordValidationResult = passwordSchema.validate(password);
    if (passwordValidationResult.error != null) {
      res.render("invalid_log_in.ejs", {type: "password"});
      return;
    }

    // Secure database access (user name not input field)
    const result = await userCollection.find({email: email}).project({username: 1, email: 1, password: 1, in_game_name: 1, _id: 1}).toArray();
    
    // User not found
    console.log(result);
    if (result.length != 1) {
      res.render("invalid_log_in.ejs", {type: "email (user not found)"});
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
      res.render("invalid_log_in.ejs", {type: "password"});
      return;
    }
});

// Log out
app.get('/logout', async (req,res) => {
    const userCollection = database.db(mongodb_database).collection('users')
    await userCollection.deleteOne({ _id: req.session._id });
    req.session.destroy();
    res.redirect('/');
});

// TODO: Add 404 not found page here

app.listen(port, () => {
    console.log('Server running on port ' + port);
  })