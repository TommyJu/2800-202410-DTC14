const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const ejs = require('ejs');
app.set('view engine', 'ejs');

const weatherKey = process.env.OPEN_WEATHER_API_KEY;

app.use(cors());

app.listen(3000, () => {
    console.log('Server running on port 3000');
    });

app.get("/", (req, res) => {
    fetch (`https://api.openweathermap.org/data/2.5/weather?q=${req.query.selectCity}, BC, CAS&appid=${weatherKey}&units=metric`)
    .then((current) => current.json())
    .then((current) => {
        if (current.message === 'city not found')
            return res.send('City not found')
        const cityName = current.name
        const weatherToday = current.weather[0].main
        const weatherTemp = current.main.temp
        const weatherIcon = current.weather[0].icon
        res.render('fitness_weather', {cityName, weatherToday, weatherTemp, weatherIcon})
    });
});