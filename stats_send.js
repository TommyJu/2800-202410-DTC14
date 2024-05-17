require("./utils.js");
require('dotenv').config();

const express = require('express');
const app = express();
const ejs = require('ejs');
app.set('view engine', 'ejs');
app.use(express.static(__dirname + "/public"));

app.listen(3000, () => {
    console.log("Listening on port 3000");
});

app.get('/stats', (req, res) => {
    res.render("stat_summary.ejs")
});

