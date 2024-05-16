const bcrypt = require('bcrypt');
const Joi = require('joi');
const saltRounds = 12;

module.exports = { submitUser };

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