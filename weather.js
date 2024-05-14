const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();

const weatherKey = process.env.OPEN_WEATHER_API_KEY;

app.use(cors());

app.listen(3000, () => {
    console.log('Server running on port 3000');
    });

app.get("/getWeatherOfACityByName", (req, res) => {
    fetch (`https://api.openweathermap.org/data/2.5/weather?q=Vancouver&appid=${weatherKey}`)
    .then((resp) => resp.json())
    .then((resp) => {
        const weatherToday = resp.weather[0].main;
        res.send(weatherToday);
    });
});