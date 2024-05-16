const bcrypt = require('bcrypt');
const Joi = require('joi');
const saltRounds = 12;
const expireTime = 1 * 60 * 60 * 1000; // one hour expiry time

module.exports = { submitUser, logInUser };

async function submitUser(
  req, res,
  username, userCollection,
  email, password,
  securityQuestion, securityAnswer) {
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
    gameTasks: [],
    fitnessTasks: [],
    dietTasks: []
  });

  req.session.authenticated = true;
  req.session.username = username;
  res.redirect('/');
}

async function logInUser(req, res, username, password, userCollection) {
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
}