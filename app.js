let apiKey = '9505fd1df737e20152fbd78cdb289b6a';
let weatherUrl = 'https://api.openweathermap.org/data/2.5/weather?units=metric&appid=' + apiKey;
let oneCallUrl = 'https://api.openweathermap.org/data/2.5/onecall?units=metric&exclude=minutely,hourly&appid=' + apiKey;
let city = document.querySelector('.name');
let form = document.querySelector("form");
let temperature = document.querySelector('.temperature');
let description = document.querySelector('.description');
let valueSearch = document.getElementById('name');
let clouds = document.getElementById('clouds');
let humidity = document.getElementById('humidity');
let pressure = document.getElementById('pressure');
let main = document.querySelector('main');
let weatherAlert = document.getElementById('alert-description');
let rainProbability = document.getElementById('rain-prob');

// Weather description to background color mapping
const weatherToColor = {
    "clear sky": "#f7e9a0",
    "sunny": "#ffeb3b",
    "partly cloudy": "#ffe0b2",
    "few clouds": "#fde0b4",
    "mostly cloudy": "#cfd8dc",
    "overcast clouds": "#90a4ae",
    "scattered clouds": "#80a6ae",
    "light rain": "#b3e5fc",
    "moderate rain": "#64b5f6",
    "heavy rain": "#2196f3",
    "showers": "#03a9f4",
    "drizzle": "#b3e5fc",
    "thunderstorms": "#d32f2f",
    "rain and snow": "#80cbc4",
    "light snow": "#e0f7fa",
    "moderate snow": "#b2ebf2",
    "heavy snow": "#80deea",
    "snow showers": "#4dd0e1",
    "sleet": "#26c6da",
    "blowing snow": "#00acc1",
    "hail": "#006064",
    "small hail": "#00838f",
    "large hail": "#00bcd4",
    "fog": "#cfd8dc",
    "mist": "#eceff1",
    "freezing fog": "#b0bec5",
    "breezy": "#ffcc80",
    "windy": "#ffb74d",
    "strong winds": "#ffa726",
    "hurricane": "#ef5350",
    "tornado": "#e53935",
    "smoke": "#8d6e63",
    "haze": "#bdbdbd",
    "dust": "#d7ccc8",
    "sandstorm": "#bcaaa4",
    "ash": "#a1887f",
    "squalls": "#7b1fa2",
    "extreme heat": "#f4511e",
    "extreme cold": "#3f51b5",
    "blizzards": "#5c6bc0",
    "ice storms": "#7986cb",
    "severe thunderstorms": "#d32f2f",
    "tropical storms": "#388e3c",
    "cyclones": "#7cb342",
    "typhoons": "#8bc34a",
    "freezing rain": "#03a9f4",
    "rain and hail": "#00acc1",
    "wintry mix": "#4dd0e1",
    "frost": "#b0bec5",
    "frost and fog": "#90a4ae"
};

// Function to fetch weather data
const searchWeather = () => {
    fetch(weatherUrl + '&q=' + valueSearch.value)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            console.log(data);
            if (data.cod == 200) {
                // Update city name and flag
                city.querySelector('figcaption').innerHTML = data.name;
                city.querySelector('img').src = `https://flagsapi.com/${data.sys.country}/shiny/32.png`;

                // Update weather icon and temperature
                updateWeatherIcon(data.weather[0].icon);
                temperature.querySelector('span').innerText = data.main.temp;

                // Update description, cloudiness, humidity, and pressure
                description.innerText = data.weather[0].description;
                clouds.innerText = data.clouds.all;
                humidity.innerText = data.main.humidity;
                pressure.innerText = data.main.pressure;

                // Adjust heights of the boxes
                adjustBoxHeights();

                // Add sunrise and sunset times
                addSunriseSunset(data.sys.sunrise, data.sys.sunset, data.timezone);

                // Fetch and display AQI data
                fetchAQI(data.coord.lat, data.coord.lon);

                // Update local time
                updateLocalTime(data.dt, data.timezone);

                // Update background color
                updateBackgroundColor(data.weather[0].description);

                // Fetch and display weather alerts and rain probability
                fetchWeatherAlerts(data.coord.lat, data.coord.lon);

            } else {
                // Show error message if city not found
                main.classList.add('error');
                setTimeout(() => {
                    main.classList.remove('error');
                }, 1000);
            }
            // Clear input field
            valueSearch.value = '';
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
}

// Function to fetch and display weather alerts and rain probability
const fetchWeatherAlerts = (lat, lon) => {
    fetch(`${oneCallUrl}&lat=${lat}&lon=${lon}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            if (data.alerts && data.alerts.length > 0) {
                weatherAlert.innerText = data.alerts[0].event;
            } else {
                weatherAlert.innerText = 'No alerts';
            }
            if (data.daily && data.daily.length > 0) {
                rainProbability.innerText = (data.daily[0].pop * 100).toFixed(2) + '%';
            } else {
                rainProbability.innerText = 'No data';
            }
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
}

// Function to update weather icon
const updateWeatherIcon = (iconCode) => {
    let iconUrl = `https://openweathermap.org/img/wn/${iconCode}.png`;
    temperature.querySelector('img').src = iconUrl;
}

// Function to fetch and display AQI data
const fetchAQI = (lat, lon) => {
    let aqiUrl = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`;
    fetch(aqiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            const aqi = data.list[0].main.aqi;
            document.getElementById('aqi').innerText = aqi;
            // Display main pollutant if available
            if (data.list[0].components) {
                const mainPollutant = Object.keys(data.list[0].components).reduce((a, b) => data.list[0].components[a] > data.list[0].components[b] ? a : b);
                document.getElementById('main-pollutant').innerText = mainPollutant;
            } else {
                document.getElementById('main-pollutant').innerText = '-';
            }
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
}

// Function to add sunrise and sunset times
const addSunriseSunset = (sunriseTimestamp, sunsetTimestamp, timezone) => {
    let sunriseTime = formatTime(sunriseTimestamp, timezone);
    let sunsetTime = formatTime(sunsetTimestamp, timezone);
    document.getElementById('sunrise').innerText = sunriseTime;
    document.getElementById('sunset').innerText = sunsetTime;
}

// Function to format time
const formatTime = (timestamp, timezone) => {
    let date = new Date((timestamp + timezone) * 1000);
    return `${('0' + date.getUTCHours()).slice(-2)}:${('0' + date.getUTCMinutes()).slice(-2)}`;
}

// Function to update local time
const updateLocalTime = (timestamp, timezone) => {
    let localTime = formatTime(timestamp, timezone);
    document.getElementById('local-time').innerText = localTime;
}

// Function to adjust box heights
const adjustBoxHeights = () => {
    let boxes = document.querySelectorAll('.box');
    let maxHeight = 0;
    boxes.forEach(box => {
        box.style.height = 'auto';
        maxHeight = Math.max(maxHeight, box.offsetHeight);
    });
    boxes.forEach(box => box.style.height = maxHeight + 'px');
}

// Function to update background color based on weather description
const updateBackgroundColor = (description) => {
    let bgColor = weatherToColor[description.toLowerCase()] || '#ffffff';
    main.style.backgroundColor = bgColor;
}

// Add event listener to the form
form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (valueSearch.value != '') {
        searchWeather();
    }
});

// Set default city and fetch weather data
const initApp = () => {
    valueSearch.value = 'Maharastra';
    searchWeather();
}

// Call initApp function
initApp();
