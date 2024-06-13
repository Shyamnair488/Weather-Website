let id = '9505fd1df737e20152fbd78cdb289b6a';
let url = 'https://api.openweathermap.org/data/2.5/weather?units=metric&appid=' + id;
let city = document.querySelector('.name');
let form = document.querySelector("form");
let temperature = document.querySelector('.temperature');
let description = document.querySelector('.description');
let valueSearch = document.getElementById('name');
let clouds = document.getElementById('clouds');
let humidity = document.getElementById('humidity');
let pressure = document.getElementById('pressure');
let main = document.querySelector('main');

// Function to fetch weather data
const searchWeather = () => {
    fetch(url + '&q=' + valueSearch.value)
        .then(response => response.json())
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
            } else {
                // Show error message if city not found
                main.classList.add('error');
                setTimeout(() => {
                    main.classList.remove('error');
                }, 1000);
            }
            // Clear input field
            valueSearch.value = '';
        });
}

// Function to update weather icon
const updateWeatherIcon = (iconCode) => {
    let iconUrl = `https://openweathermap.org/img/wn/${iconCode}.png`;
    temperature.querySelector('img').src = iconUrl;
}

// Function to fetch and display AQI data
const fetchAQI = (lat, lon) => {
    let aqiUrl = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${id}`;
    fetch(aqiUrl)
        .then(response => response.json())
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

// Function to adjust the heights of the boxes based on their values
const adjustBoxHeights = () => {
    let boxes = document.querySelectorAll('.dynamic-height');
    boxes.forEach(box => {
        let value = box.querySelector('span:last-child').innerText.replace('%', '').replace('hPa', '');
        if (!isNaN(value) && value != '-') {
            value = parseFloat(value);
            box.style.setProperty('--height-percentage', `${value}%`);
        }
    });
}

// Event listener for form submission
form.addEventListener("submit", (e) => {
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
