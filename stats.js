require("./utils.js");
require('dotenv').config();

const express = require('express');
const app = express();
const ejs = require('ejs');
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.render("stat_summary.ejs")
});