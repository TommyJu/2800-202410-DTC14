const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const ejs = require('ejs');
app.set('view engine', 'ejs');

module.exports = {
    getWeather: getWeather
}

app.use(cors());

function getWeather(url, res) {
    fetch(url)
        .then((current) => current.json())
        .then((current) => {
            if (current.message)
                return res.send('Error')
            const cityName = current.name
            const weatherToday = current.weather[0].main
            const weatherTemp = current.main.temp
            const weatherIcon = current.weather[0].icon
            res.render('fitness_weather', { cityName, weatherToday, weatherTemp, weatherIcon })
        });
}