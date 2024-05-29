const bcrypt = require('bcrypt');
const Joi = require('joi');
const saltRounds = 12;
const expireTime = 1 * 60 * 60 * 1000; // one hour expiry time
const lolAPI = require('./riotLeagueAPI.js');
const { get } = require('http');

module.exports = { submitUser, logInUser, resetPassword, renderSecurityQuestion };

async function submitUser(
  req, res,
  username, userCollection,
  email, password,
  securityQuestion, securityAnswer,
  RiotUsername, RiotID, city) {
  const usernameSchema = Joi.string().max(20).required();
  const emailSchema = Joi.string().max(40).required();
  const passwordSchema = Joi.string().max(20).required();
  const securityAnswerSchema = Joi.string().max(20).alphanum().required();
  const RiotUsernameSchema = Joi.string().min(3).max(16).alphanum().allow("").optional();
  const RiotIDSchema = Joi.string().min(3).max(5).alphanum().allow("").optional();
  const citySchema = Joi.string().min(3).alphanum().allow("").optional();

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

  const RiotUsernameValidationResult = RiotUsernameSchema.validate(RiotUsername);
  if (RiotUsernameValidationResult.error != null) {
    res.render("invalid_sign_up.ejs", { type: "Riot username" })
    return;
  }

  const RiotIDValidationResult = RiotIDSchema.validate(RiotID);
  if (RiotIDValidationResult.error != null) {
    res.render("invalid_sign_up.ejs", { type: "Riot ID" })
    return;
  }

  const cityValidationResult = citySchema.validate(city);
  if (cityValidationResult.error != null) {
    res.render("invalid_sign_up.ejs", { type: "city" })
    return;
  }

  if ((await lolAPI.getRiotPUUID(RiotUsername, RiotID) === false) && (RiotUsername != "" && RiotID != "")) {
    console.log("Riot account does not exists lil bro.")
    res.render("invalid_sign_up.ejs", { type: "Riot account does not exist lil bro." })
    return;
  }

  if ((await lolAPI.getSummonerEncryptedIdAndLevel(await lolAPI.getRiotPUUID(RiotUsername, RiotID)) === false) && (RiotUsername != "" && RiotID != "")) {
    console.log("No League on this rito account lil bro.")
    res.render("invalid_sign_up.ejs", { type: "No League on this rito account lil bro." })
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
    in_game_name: RiotUsername,
    RiotID: RiotID,
    securityQuestion: securityQuestion,
    securityAnswer: hashedSecurityAnswer,
    gameTasks: [],
    fitnessTasks: [],
    dietTasks: [],
    levels: {
      game: {
        level: 1,
        exp: 0
      },
      diet: {
        level: 1,
        exp: 0
      },
      fitness: {
        level: 1,
        exp: 0
      }
    },
    rank: "unranked",
    achievements: [],
    city: city,
    friends: [],
    friendRequests: []
  });

  req.session.authenticated = true;
  req.session.username = username;
  if ((RiotUsername) && (RiotID)) {
    req.session.RiotUsername = RiotUsername;
    req.session.RiotID = RiotID;
  }
  res.redirect('/');
}

async function logInUser(req, res, username, password, userCollection) {
  const usernameSchema = Joi.string().max(20).alphanum().required();
  const passwordSchema = Joi.string().max(20).alphanum().required();

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
}

async function resetPassword(req, res, username, securityAnswer, newPassword, userCollection) {
  user = await userCollection.findOne(
    { username: username },
    { projection: { securityAnswer: 1 } });

  const newPasswordSchema = Joi.string().max(20).alphanum().required();
  const newPasswordValidationResult = newPasswordSchema.validate(newPassword);
  const securityAnswerSchema = Joi.string().max(20).alphanum().required();
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
      { username: username },
      { $set: { password: hashedNewPassword } });

    res.render("successful_password_recovery.ejs");
    return;
  } else {
    res.render("invalid_password_recovery.ejs", { type: "security answer" });
    return;
  }
}

async function renderSecurityQuestion(req, res, username, userCollection) {
  const usernameSchema = Joi.string().max(20).alphanum().required();
  const usernameValidationResult = usernameSchema.validate(username);

  if (usernameValidationResult.error != null) {
    res.render("invalid_password_recovery.ejs", { type: "username" });
    return;
  }

  user = await userCollection.findOne(
    { username: username },
    { projection: { securityQuestion: 1 } });

  // User not found
  if (!user) {
    res.render("invalid_password_recovery.ejs", { type: "username (user not found)" });
    return;
  }

  securityQuestion = user.securityQuestion;

  // Render security question
  res.render("security_question.ejs", {
    username: username,
    securityQuestion: securityQuestion
  })


}