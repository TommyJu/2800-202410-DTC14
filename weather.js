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
    // If there is an error converting the URL to JSON, return undefined
    if (currentJSON.message)
        return undefined;
    const cityName = currentJSON.name
    const weatherToday = currentJSON.weather[0].main
    const weatherTemp = currentJSON.main.temp
    const weatherIcon = currentJSON.weather[0].icon
    weatherData = [cityName, weatherToday, weatherTemp, weatherIcon]
    return weatherData

}