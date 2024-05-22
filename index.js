require("./utils.js");
require('dotenv').config();
weather = require('./weather.js')
const taskFunctions = require("./task_functions.js");
const authenticationFunctions = require("./authentication_functions.js");
const levelFunctions = require("./level_functions.js");

const { ObjectId } = require('mongodb');
const express = require('express');
const app = express();
const axios = require('axios');
const readline = require('readline');
const mongoose = require('mongoose');
const path = require('path');
const favicon = require('serve-favicon');

// Importing the API logic functions to link back end data to front end display.
const lolAPI = require('./riotLeagueAPI.js');

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
const weatherKey = process.env.OPEN_WEATHER_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

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

const MONGODB_URI = `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_HOST}/${process.env.MONGODB_DATABASE}?retryWrites=true&w=majority`;

// Connect to MongoDB
mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Error connecting to MongoDB:', err));

const userSchema = new mongoose.Schema({
  allergies: String
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('Welcome to ChatGPT!');

app.use(express.json());

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

// Middleware to store previous page URL in session
app.use((req, res, next) => {
  // Store the previous page URL in the session
  req.session.previousPage = req.headers.referer;
  next();
});

// Home page ---------------------------
app.get('/', async (req, res) => {
  if (req.session.authenticated) {
    username = req.session.username;
    const result = await userCollection.findOne({ username: username }, { projection: { levels: 1, rank: 1 } });
    levelGame = result.levels.game.level;
    levelFitness = result.levels.fitness.level;
    levelDiet = result.levels.diet.level;
    expGame = result.levels.game.exp;
    expFitness = result.levels.fitness.exp;
    expDiet = result.levels.diet.exp;

    rank = result.rank;
    res.render("stat_summary.ejs", { 
      username: username, 
      levelGame: levelGame, 
      levelFitness: levelFitness, 
      levelDiet: levelDiet,
      expGame: expGame,
      expFitness: expFitness,
      expDiet: expDiet,
      expMax: levelFunctions.EXP_PER_LEVEL, 
      rank: rank });
    // res.render("home_logged_in.ejs", { username: req.session.username });
    return;
  }
  res.render("home_logged_out.ejs");
})

//Stats page ---------------------------
// app.get('/stats', async (req, res) => {

// })

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
  var RiotUsername = req.body.RiotUsername;
  var RiotID = req.body.RiotID;

  await authenticationFunctions.submitUser(
    req, res,
    username, userCollection,
    email, password,
    securityQuestion, securityAnswer,
    RiotUsername, RiotID);
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

})

app.post('/password_reset', async (req, res) => {
  // Validate new password and security answer input
  username = req.body.username;
  securityAnswer = req.body.securityAnswer;
  newPassword = req.body.newPassword;

  await authenticationFunctions.resetPassword(req, res, username, securityAnswer, newPassword, userCollection);
})

// Weather page
app.get('/weather', async (req, res) => {
  username = req.session.username
  const result = await userCollection.find({ username: username }).toArray();
  defaultCity = result[0].city
  if (!req.query.selectCity) {
    url = `https://api.openweathermap.org/data/2.5/weather?q=${defaultCity},CA&appid=${weatherKey}&units=metric`
  } else {
    url = `https://api.openweathermap.org/data/2.5/weather?q=${req.query.selectCity},CA&appid=${weatherKey}&units=metric`
  }
  weather.getWeather(url, res)
});

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
    user_name = req.session.RiotUsername;
    user_tag = req.session.RiotID;
    if (user_name === undefined || user_tag === undefined) {
      console.log("user_name or user_tag is undefined");
      res.render("game.ejs", { tasks: tasks, gameError: "No Riot account linked to this account." });
      return;
    }
    const PUUID = await lolAPI.getRiotPUUID(user_name, user_tag);
    const summonerDetails = await lolAPI.getSummonerLevelAndID(PUUID);
    const summonerLevel = summonerDetails[1];
    const encryptedSummonerId = summonerDetails[0];
    const summonerRank = await lolAPI.getSummonerRank(encryptedSummonerId);
    if (summonerRank === null) {
      var rank = "Unranked";
    } else {
      var rank = summonerRank[0] + " " + summonerRank[1];
    }
    const match_ids = await lolAPI.getMatchHistory(PUUID);
    const winrateAndKD = await lolAPI.calculateWinLoss(match_ids, PUUID);
    const winrate = winrateAndKD[0];
    const kd = winrateAndKD[1];
    res.render("game.ejs", { tasks: tasks, level: summonerLevel, rank: rank, winrate: winrate, kd: kd});
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

app.post('/chat', async (req, res) => {
  const message = req.body.message;
  try {
    const reply = await sendMessage(message);
    res.json({ reply });
  } catch (error) {
    console.error('Error communicating with OpenAI API:', error.message);
    res.status(500).json({ error: 'Failed to communicate with OpenAI API' });
  }
});

app.post('/allergies', async (req, res) => {
  const allergies = req.body.allergies;
  const username = req.session.username;
  try {
    await userCollection.findOneAndUpdate(
      { username: username },
      { $set: { allergies: allergies } },
      { upsert: true }
    );
    res.json({ success: true, message: 'Allergies saved successfully' });
  } catch (error) {
    console.error('Error saving allergies:', error.message);
    res.status(500).json({ error: 'Failed to save allergies' });
  }
});

app.get('/get_allergies', async (req, res) => {
  const username = req.session.username;
  try {
    const user = await userCollection.findOne({ username: username });
    if (user) {
      res.json({ allergies: user.allergies });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error('Error retrieving user allergies:', error.message);
    res.status(500).json({ error: 'Failed to retrieve user allergies' });
  }
});

async function sendMessage(message) {
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: message }],
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
        },
      }
    );
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error(error.response.data);
    throw new Error('Failed to communicate with OpenAI API');
  }
}

// Friends page
app.get('/friends', (req, res) => {
  if (req.session.authenticated) {
    res.render("friends.ejs");
    return;
  }
  res.redirect("/");
})

// Profile page
app.get('/profile', async (req, res) => {
  if (req.session.authenticated) {
    username = req.session.username;
    const result = await userCollection.find({ username }).toArray();
    
    res.render("profile.ejs", { 
      username: username, 
      email: result[0].email, 
      gameName: result[0].in_game_name, 
      allergies: result[0].allergies,
      levelGame: result[0].levels.game.level,
      levelDiet: result[0].levels.diet.level,
      levelFitness: result[0].levels.fitness.level,
      levelMax: levelFunctions.MAX_LEVEL
    });
    return;
  }
  res.redirect("/");
})

// Add task from modal form
app.post('/add_task', async (req, res) => {
  let title = req.body.title;
  let description = req.body.description;
  let category = req.body.category;
  let username = req.session.username;

  taskFunctions.addTask(title, description, category, username, userCollection);

  res.redirect(req.get('referer'));
})

app.post('/delete_task', async (req, res) => {
  let username = req.session.username;
  let taskCategory = req.body.category;
  let taskIdToDelete = req.body.taskId;
  await taskFunctions.deleteTask(username, userCollection, taskCategory, taskIdToDelete)

  res.redirect(req.get('referer'));
})

app.post('/complete_task', async (req, res) => {
  let username = req.session.username;
  let taskCategory = req.body.category;
  let taskIdToDelete = req.body.taskId;
  let isLeveledUp = await taskFunctions.completeTask(username, userCollection, taskCategory, taskIdToDelete);
  if(isLeveledUp) {
    res.redirect(`/level_up?category=${taskCategory}`);
  } else {
    res.redirect(req.get('referer'));
  }
})

app.get('/level_up', async (req, res) => {
  let taskCategory = req.query.category;
  // Fetch the user
  try {
    user = await userCollection.findOne(
        { username: req.session.username },
        { projection: {
            [`levels.${taskCategory}`]: 1,
            rank: 1
        }});
} catch (error) {
    console.error("Failed to fetch user on level up");
}
  // Render level up page
  res.render("level_up.ejs", {
    username: req.session.username,
    taskCategory: taskCategory,
    level: user.levels[taskCategory].level,
    rank: user.rank
  })
})

// Redirect to the previous page when user confirms level up
app.post('/level_up_confirmation', (req, res) => {
  res.redirect(`/${req.body.taskCategory}` || '/');
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
