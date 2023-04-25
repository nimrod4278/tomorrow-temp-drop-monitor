require('dotenv').config();
const axios = require('axios');

const API_KEY = process.env.API_KEY;

const MONITOR_INTERVAL = 15 * 60 * 1000;

const DROP_TIMEFRAME = 15
const DROP_THRESHOLD = 2

const locations = [
    "JFK",
    "ORD",
    "DFW"
];

const checkForTemperatureDrop = async (location, timestep = "1m") => {
    try {
        const options = { method: 'GET', headers: { accept: 'application/json' } };
        let response = await axios.get(`https://api.tomorrow.io/v4/weather/forecast?location=${location}&timesteps=${timestep}&apikey=${API_KEY}`, options)
        response = await response.data
        const weatherData = response.timelines.minutely;
        startTemp = weatherData[0].values.temperature
        for (let i = 1; i < DROP_TIMEFRAME; i++) {
            const currentTemp = weatherData[i].values.temperature
            const diff = startTemp - currentTemp
            if (diff >= DROP_THRESHOLD) {
                console.log(`Temperature drop of at least ${DROP_THRESHOLD}°C expected in the next ${DROP_TIMEFRAME} minutes at ${location.name} on ${weatherData[i].time}.`);
            }
        }       
    } catch (error) {
        console.error(error);
    }
}

const monitorTemperatures = () => {
    console.log(`Checking for temperature drops starting from ${new Date()}...`);
    locations.forEach(location => {
        checkForTemperatureDrop(location);
    });
}

const start = () => {
    monitorTemperatures()
    setInterval(() => {
        monitorTemperatures()
    }, MONITOR_INTERVAL);
}

start();
