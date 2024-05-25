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

async function getWeather(url) {
    current = await fetch(url)
    currentJSON = await current.json()
    if (currentJSON.message)
        return res.send('City not found')
    const cityName = currentJSON.name
    const weatherToday = currentJSON.weather[0].main
    const weatherTemp = currentJSON.main.temp
    const weatherIcon = currentJSON.weather[0].icon
    weatherData = [cityName, weatherToday, weatherTemp, weatherIcon]
    return weatherData

}