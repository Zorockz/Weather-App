
    
    API_KEY: 'JDJR4FR8EKM2S4KL8TDC64QNQ' // I know this is not a good practice, but I am using it for educational purposes only.plus cards not on file

// DOM Elements - These variables connect our JavaScript to the HTML elements
const cityInput = document.getElementById('city');           // The text input where users type city names
const searchBtn = document.getElementById('searchBtn');      // The search button
const errorContainer = document.getElementById('errorContainer');  // Container for error messages
const errorMessage = document.getElementById('errorMessage');      // Paragraph where error text appears
const weatherContainer = document.getElementById('weatherContainer');  // Container for weather information
const cityNameElement = document.getElementById('cityName');         // H2 element displaying city name
const temperatureElement = document.getElementById('temperature');   // Paragraph for temperature
const descriptionElement = document.getElementById('description');   // Paragraph for weather description
const humidityElement = document.getElementById('humidity');         // Paragraph for humidity info
const windSpeedElement = document.getElementById('windSpeed');       // Paragraph for wind speed
const searchHistoryList = document.getElementById('searchHistory');  // UL element for search history



// Use the API key in your fetch calls
const API_KEY = 'JDJR4FR8EKM2S4KL8TDC64QNQ';// dont have backend to hide it or card on file :)
const API_URL = 'https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/';

// Search History Array - Stores previously searched cities
// We use localStorage to persist data between page refreshes
let searchHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];

// Event Listeners - Code that waits for and responds to user interactions
document.addEventListener('DOMContentLoaded', () => {
    // This runs when the page first loads
    displaySearchHistory();  // Show any previously saved search history
});

// Search button click handler - Triggers when the user clicks the search button
searchBtn.addEventListener('click', () => {
    const city = cityInput.value.trim();  // Get city name and remove extra spaces
    if (city) {
        getWeatherData(city);  // If there's text, search for that city
    } else {
        showError('Please enter a city name');  // Show error if input is empty
    }
});

// Enter key press handler - Allows users to press Enter instead of clicking Search
cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {  // Check if the pressed key is Enter
        const city = cityInput.value.trim();
        if (city) {
            getWeatherData(city);
        } else {
            showError('Please enter a city name');
        }
    }
});

// Fetch Weather Data - Makes the API request to Visual Crossing
async function getWeatherData(city) {
    try {
        // Clear any previous error messages
        hideError();
        
        // Build the API URL with the city and API key
        // Visual Crossing API format: {URL}/{LOCATION}/{PARAMETERS}?key={API_KEY}
        const requestUrl = `${API_URL}${encodeURIComponent(city)}/today?unitGroup=metric&include=current&key=${API_KEY}`;
        
        // Fetch data from the API - async/await pattern makes async code easier to read
        const response = await fetch(requestUrl);
        
        // Check if the request was successful
        if (!response.ok) {
            // Handle different types of errors based on status code
            throw new Error(response.status === 404 
                ? 'Location not found. Please check the spelling and try again.' 
                : 'Failed to fetch weather data. Please try again later.');
        }
        
        // Parse the JSON response data
        const data = await response.json();
        
        // Update the UI with the weather data
        displayWeatherData(data);
        
        // Save this search to the history
        addToSearchHistory(city);
        
    } catch (error) {
        // If anything goes wrong, show the error and hide weather display
        showError(error.message);
        hideWeatherData();
    }
}

// Display Weather Data - Updates the UI with weather information
function displayWeatherData(data) {
    // Visual Crossing has a different structure than OpenWeatherMap, so we adapt accordingly
    
    // Set city name - Visual Crossing provides address and resolvedAddress
    cityNameElement.textContent = data.resolvedAddress || data.address;
    
    // Set temperature - We get the current conditions
    const current = data.currentConditions;
    const tempCelsius = Math.round(current.temp);  // Round to whole number
    temperatureElement.textContent = `${tempCelsius}°C`;
    
    // Set weather description - Visual Crossing provides a conditions field
    const weatherDesc = current.conditions || 'Clear';
    descriptionElement.textContent = capitalizeFirstLetter(weatherDesc);
    
    // Set humidity - Visual Crossing provides humidity as a decimal (0.75 = 75%)
    const humidityPercentage = Math.round((current.humidity || 0) * 100);
    humidityElement.textContent = `Humidity: ${humidityPercentage}%`;
    
    // Set wind speed - Visual Crossing provides windspeed
    windSpeedElement.textContent = `Wind: ${current.windspeed || 0} km/h`;
    
    // Show the weather container by removing the 'hide' class
    weatherContainer.classList.remove('hide');
}

// Add to Search History - Records what the user has searched for
function addToSearchHistory(city) {
    // Remove this city if it already exists in history (to avoid duplicates)
    searchHistory = searchHistory.filter(item => item.toLowerCase() !== city.toLowerCase());
    
    // Add the new city to the beginning of the array (most recent first)
    searchHistory.unshift(city);
    
    // Keep only the last 5 searches (limit history length)
    if (searchHistory.length > 5) {
        searchHistory.pop();  // Remove the oldest search
    }
    
    // Save the updated history to localStorage for persistence
    localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
    
    // Update the history display in the UI
    displaySearchHistory();
}

// Display Search History - Creates the clickable history list
function displaySearchHistory() {
    // Clear the current list to avoid duplicates
    searchHistoryList.innerHTML = '';
    
    // Add each history item as a list item (<li>)
    searchHistory.forEach(city => {
        // Create a new list item element
        const li = document.createElement('li');
        
        // Set its text to the city name
        li.textContent = city;
        
        // Make it clickable - when clicked, it searches for that city
        li.addEventListener('click', () => {
            cityInput.value = city;  // Fill the search input
            getWeatherData(city);    // Trigger the search
        });
        
        // Add the list item to the search history list
        searchHistoryList.appendChild(li);
    });
}

// Error Handling Functions
function showError(message) {
    // Set the error message text
    errorMessage.textContent = message;
    
    // Make the error container visible
    errorContainer.classList.remove('hide');
}

function hideError() {
    // Hide the error container
    errorContainer.classList.add('hide');
}

function hideWeatherData() {
    // Hide the weather data container
    weatherContainer.classList.add('hide');
}

// Text Formatting Helper
function capitalizeFirstLetter(string) {
    // Make the first letter uppercase for better presentation
    return string.charAt(0).toUpperCase() + string.slice(1);
}