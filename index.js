require("./utils.js");
require('dotenv').config();

const friendFunctions = require("./public/friend_functions.js");

const express = require('express');
const app = express();

const session = require('express-session');
const MongoStore = require('connect-mongo');
const bcrypt = require('bcrypt');
const Joi = require('joi');
const ejs = require('ejs');
const { error } = require("console");
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

  const usernameSchema = Joi.string().max(20).required();
  const emailSchema = Joi.string().max(40).required();
  const passwordSchema = Joi.string().max(20).required();

  // Username verification
  const usernameValidationResult = usernameSchema.validate(username);
  if (usernameValidationResult.error != null) {
    res.render("invalid_sign_up.ejs", { type: "username" })
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

  // Hash password
  var hashedPassword = await bcrypt.hash(password, saltRounds);

  // Insert user into collection
  await userCollection.insertOne({ username: username, email: email, password: hashedPassword, in_game_name: null });
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

  const usernameSchema = Joi.string().max(40).required();
  const passwordSchema = Joi.string().max(20).required();

  // Email verification
  const emailValidationResult = usernameSchema.validate(username);
  if (emailValidationResult.error != null) {
    res.render("invalid_log_in.ejs", { type: "email" });
    return;
  }

  // Password verification
  const usernameValidationResult = usernameSchema.validate(username);
  if (usernameValidationResult.error != null) {
    res.render("invalid_log_in.ejs", { type: "username" });
    return;
  }

  // Secure database access (user name not input field)
  const result = await userCollection.find({ username: username }).project({ username: 1, email: 1, password: 1, in_game_name: 1, _id: 1, RiotID: 1 }).toArray();

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
    if (!(result[0].in_game_name == null)) {
      req.session.RiotUsername = result[0].in_game_name;
    }
    if (!(result[0].RiotID == null)) {
      req.session.RiotID = result[0].RiotID;
    }
    res.redirect('/');
    return;
  }
  else {
    res.render("invalid_log_in.ejs", { type: "password" });
    return;
  }

});

// Freinds
app.get('/friends', async (req, res) => {
  const userCollection = await database.db(mongodb_database).collection('users');
  if (req.session.authenticated) {
    // if logged in
    // gets user from DB based on session username
    const userInfo = await userCollection.findOne({ username: req.session.username });
    let userFriends = [];
    try {
      //attempts to get friends from user
      userFriends = await userInfo.friends;
    } catch (error) {
      console.error("could not retreive firends");
    }
    res.render("friends.ejs", {
      username: req.session.username,
      friends: userFriends
    });
    return;
  } else {
    // not logged in
    res.render("home_logged_out.ejs");
  }
})

// method to add friends
app.post('/addFriend', async (req, res) => {
  const recipientUsername = req.body.friendUsername;
  // need to catch if user DNE
  const userCollection = await database.db(mongodb_database).collection('users');
  const recipientInfo = await userCollection.findOne({ username: recipientUsername });
  try {
    if (recipientInfo) {
      // If recipient user exists, push the current user's username to their friendRequest array
      recipientInfo.friendRequest.push(req.session.username);
      // Update the recipient user document in the database
      await userCollection.updateOne(
        { username: recipientUsername },
        { $set: { friendRequest: recipientInfo.friendRequest } }
      );
      // Redirect to the friends page
      res.redirect('/friends');
    } else {
      res.status(100).send("user not found")
    }
  } catch { console.error(error); res.status(500).send('error sending friends') }
  //   try {
  //   recipientInfo.friendRequest.push(req.session.username);
  //   res.redirect('/friends');
  // } catch (error) {
  //   console.error(error);
  //   res.status(500).send('error sending friends')
  // }
})

// Friend Request
app.get('/friendRequest', async (req, res) => {
  const userCollection = await database.db(mongodb_database).collection('users');
  if (req.session.authenticated) {
    // if logged in
    // gets user from DB based on session username
    const userInfo = await userCollection.findOne({ username: req.session.username });
    let userFriendRequest = [];
    try {
      //attempts to get friendRequest from user
      userFriendRequest = await userInfo.friendRequest;
    } catch (error) {
      console.error("could not retreive firends");
    }
    res.render("friend_request.ejs", {
      username: req.session.username,
      requests: userFriendRequest
    });
    return;
  } else {
    // not logged in
    res.render("home_logged_out.ejs");
  }
})

// method to accept friend 
app.post('/acceptFriend', async (req, res) => {
  const requester = req.body.requestedFriend;
  const accepter = req.session.username;
  const userCollection = await database.db(mongodb_database).collection('users');
  // const recipientInfo = await userCollection.findOne({ username: req.session.username });
  try {
    // adds the accepter to the requester's friends
    await userCollection.updateOne(
      { username: requester },
      { $push: { friends: accepter } }
    );
    // updates the friend requests of requester
    await userCollection.updateOne(
      { username: requester },
      { $pull: { friendRequest: accepter } }
    );
    // adds the requester to the accepter's friends
    await userCollection.updateOne(
      { username: accepter },
      { $push: { friends: requester } }
    );
    // updates the friend requests of accepter
    await userCollection.updateOne(
      { username: accepter },
      { $pull: { friendRequest: requester } }
    );
  } catch (error) {
    console.error("could not accept request(server side)", error)
  }

})

// method to reject friend
app.post('/rejectFriend', async (req, res) => {

})

// Log out
app.get('/logout', async (req, res) => {
  const userCollection = database.db(mongodb_database).collection('users')
  await userCollection.deleteOne({ _id: req.session._id });
  req.session.destroy();
  res.redirect('/');
});

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