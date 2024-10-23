"use strict";

const API = "7a5a40542c7c9a76cd6bdbdd90b43e62";

// DOM Elements
const dayEl = document.querySelector(".default_day");
const dateEl = document.querySelector(".default_date");
const btnEl = document.querySelector(".btn_section");
const inputEl = document.querySelector(".input_field");
const iconsContainer = document.querySelector(".icons");
const dayInfoEl = document.querySelector(".day_info");
const listContentEl = document.querySelector(".list_content ul");

const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// Display the day and date
const currentDate = new Date();
const dayName = days[currentDate.getDay()];
dayEl.textContent = dayName;

const options = { year: "numeric", month: "long", day: "numeric" };
const formattedDate = currentDate.toLocaleDateString(undefined, options);
dateEl.textContent = formattedDate;

// Update Time
function displayTime() {
    const currentTime = new Date();
    const hours = String(currentTime.getHours()).padStart(2, "0");
    const minutes = String(currentTime.getMinutes()).padStart(2, "0");
    const seconds = String(currentTime.getSeconds()).padStart(2, "0");

    dateEl.textContent = `${formattedDate} (Time: ${hours}:${minutes}:${seconds})`;
}

setInterval(displayTime, 1000);
displayTime();

// Check if the user has a stored location, otherwise use geolocation
window.addEventListener("load", () => {
    const storedLocation = localStorage.getItem("lastLocation");

    if (storedLocation) {
        findLocation(storedLocation);  // Load the last used location
    } else {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(success, error);
        } else {
            displayErrorMessage("Geolocation not supported.");
        }
    }
});

// Handle the geolocation success
function success(position) {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;

    findLocationByCoords(lat, lon);  // Fetch weather using coordinates
}

// Handle geolocation errors
function error() {
    displayErrorMessage("Unable to retrieve your location. Please search manually.");
}

// Fetch location data by coordinates
async function findLocationByCoords(lat, lon) {
    iconsContainer.innerHTML = ""; // Clear previous weather data
    dayInfoEl.innerHTML = "";

    try {
        const API_URL = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API}&units=metric`;
        const response = await fetch(API_URL);
        const data = await response.json();

        if (data.cod !== 200) {
            displayErrorMessage("Error fetching location data. Please try again.");
            return;
        }

        displayWeatherData(data);
        displayForeCast(lat, lon);

    } catch (error) {
        displayErrorMessage("Network error. Please try again later.");
    }
}

// Button click event listener for manual search
btnEl.addEventListener("click", (e) => {
    e.preventDefault();
    const search = inputEl.value.trim();

    if (search) {
        localStorage.setItem("lastLocation", search); // Store the last searched location
        inputEl.value = "";
        findLocation(search);
    } else {
        displayErrorMessage("Please enter a valid location.");
    }
});

// Fetch location data by name
async function findLocation(name) {
    iconsContainer.innerHTML = "";
    dayInfoEl.innerHTML = "";

    try {
        const API_URL = `https://api.openweathermap.org/data/2.5/weather?q=${name}&appid=${API}&units=metric`;
        const response = await fetch(API_URL);
        const data = await response.json();

        if (data.cod === "404") {
            displayErrorMessage("No location found. Please try again.");
            return;
        }

        if (data.cod !== 200) {
            displayErrorMessage("Error fetching data. Please try again.");
            return;
        }

        displayWeatherData(data);
        displayForeCast(data.coord.lat, data.coord.lon);

    } catch (error) {
        displayErrorMessage("Network error. Please try again later.");
    }
}

// Display weather data
function displayWeatherData(data) {
    const weatherContent = `
        <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" alt="Weather Icon">
        <h2 class="weather_temp">${Math.round(data.main.temp)}°C</h2>
        <h3 class="cloudtxt">${data.weather[0].description}</h3>
    `;
    iconsContainer.innerHTML = weatherContent;

    const rightSideContent = `
        <div class="content">
            <p class="title">NAME</p>
            <span class="value">${data.name}</span>
        </div>
        <div class="content">
            <p class="title">TEMP</p>
            <span class="value">${Math.round(data.main.temp)}°C</span>
        </div>
        <div class="content">
            <p class="title">HUMIDITY</p>
            <span class="value">${data.main.humidity}%</span>
        </div>
        <div class="content">
            <p class="title">WIND SPEED</p>
            <span class="value">${data.wind.speed} Km/h</span>
        </div>
    `;
    dayInfoEl.innerHTML = rightSideContent;
}

// Display forecast data
async function displayForeCast(lat, lon) {
    const foreCast_API = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API}&units=metric`;
    try {
        const response = await fetch(foreCast_API);
        const data = await response.json();

        const uniqueDays = [];
        const filteredForecast = data.list.filter((forecast) => {
            const forecastDate = new Date(forecast.dt_txt).getDate();
            if (!uniqueDays.includes(forecastDate)) {
                uniqueDays.push(forecastDate);
                return forecast;
            }
        });

        listContentEl.innerHTML = ""; // Clear old forecast
        filteredForecast.slice(0, 4).forEach((forecast) => {
            const forecastHTML = `
                <li>
                    <img src="https://openweathermap.org/img/wn/${forecast.weather[0].icon}@2x.png">
                    <span>${new Date(forecast.dt_txt).toLocaleDateString(undefined, { weekday: "short" })}</span>
                    <span class="day_temp">${Math.round(forecast.main.temp)}°C</span>
                </li>
            `;
            listContentEl.insertAdjacentHTML("beforeend", forecastHTML);
        });

    } catch (error) {
        displayErrorMessage("Unable to fetch forecast data. Please try again.");
    }
}

// Display error messages
function displayErrorMessage(message) {
    iconsContainer.innerHTML = `<h3 class="error_message">${message}</h3>`;
}
