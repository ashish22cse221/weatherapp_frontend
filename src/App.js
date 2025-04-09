import React, { useState, useEffect } from 'react';
import { Search as SearchIcon, Sun, Moon, Cloud, CloudRain, Wind, Droplet, Thermometer } from 'lucide-react';
import './App.css';

const App = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [location, setLocation] = useState('New York');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');

  const API_KEY = '7db7990f445a3886e33822ef9bafb8bc';
  const API_URL = 'https://api.openweathermap.org/data/2.5';

  useEffect(() => {
    fetchWeatherData(location);
  }, [location]);

  const fetchWeatherData = async (city) => {
    setLoading(true);
    setError(null);
    
    try {
      const currentWeatherResponse = await fetch(
        `${API_URL}/weather?q=${city}&appid=${API_KEY}&units=metric`
      );
      
      if (!currentWeatherResponse.ok) {
        const errorData = await currentWeatherResponse.json();
        throw new Error(errorData.message || 'City not found or API error');
      }
      
      const currentWeatherData = await currentWeatherResponse.json();
      
      const forecastResponse = await fetch(
        `${API_URL}/forecast?q=${city}&appid=${API_KEY}&units=metric`
      );
      
      if (!forecastResponse.ok) {
        throw new Error('Error fetching forecast data');
      }
      
      const forecastData = await forecastResponse.json();
      
      const processedCurrentWeather = {
        city: currentWeatherData.name,
        country: currentWeatherData.sys.country,
        temp: Math.round(currentWeatherData.main.temp),
        condition: currentWeatherData.weather[0].main,
        description: currentWeatherData.weather[0].description,
        feelsLike: Math.round(currentWeatherData.main.feels_like),
        humidity: currentWeatherData.main.humidity,
        windSpeed: Math.round(currentWeatherData.wind.speed * 3.6),
        pressure: currentWeatherData.main.pressure,
        visibility: Math.round(currentWeatherData.visibility / 1000),
        sunrise: new Date(currentWeatherData.sys.sunrise * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        sunset: new Date(currentWeatherData.sys.sunset * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        icon: currentWeatherData.weather[0].icon,
        dt: currentWeatherData.dt
      };
      
      const dailyForecasts = [];
      const daysProcessed = new Set();
      const today = new Date().setHours(0, 0, 0, 0);
      
      forecastData.list.forEach(item => {
        const date = new Date(item.dt * 1000);
        const day = date.toLocaleDateString('en-US', { weekday: 'short' });
        const dateString = date.toLocaleDateString('en-US');
        
        const itemDay = date.setHours(0, 0, 0, 0);
        if (itemDay > today && !daysProcessed.has(dateString) && dailyForecasts.length < 5) {
          daysProcessed.add(dateString);
          dailyForecasts.push({
            day,
            condition: item.weather[0].main,
            description: item.weather[0].description,
            maxTemp: Math.round(item.main.temp_max),
            minTemp: Math.round(item.main.temp_min),
            icon: item.weather[0].icon,
            humidity: item.main.humidity,
            windSpeed: Math.round(item.wind.speed * 3.6)
          });
        }
      });
      
      setWeatherData(processedCurrentWeather);
      setForecast(dailyForecasts);
      setLoading(false);
      
    } catch (err) {
      setError(`Error: ${err.message}. Please check the city name and try again.`);
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      setLocation(query);
      setQuery('');
    }
  };

  const getWeatherIcon = (iconCode, size = 64, className = "") => {
    if (iconCode) {
      return (
        <img 
          src={`https://openweathermap.org/img/wn/${iconCode}@2x.png`} 
          alt="Weather icon" 
          width={size} 
          height={size} 
          className={className}
        />
      );
    }
    
    return <Sun size={size} className={`text-yellow-500 ${className}`} />;
  };

  const getWeatherBackground = (condition) => {
    if (!condition) return "from-blue-400 to-blue-600";
    
    switch (condition.toLowerCase()) {
      case 'clear':
        return "from-yellow-400 to-orange-500";
      case 'clouds':
        return "from-gray-400 to-slate-600";
      case 'rain':
      case 'drizzle':
        return "from-blue-400 to-blue-700";
      case 'thunderstorm':
        return "from-gray-700 to-gray-900";
      case 'snow':
        return "from-blue-100 to-blue-300";
      case 'mist':
      case 'fog':
      case 'haze':
        return "from-gray-300 to-gray-500";
      default:
        return "from-blue-400 to-blue-600";
    }
  };

  return (
    <div className="app-container bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-4 flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex items-center space-x-2 mb-2 md:mb-0">
            <Cloud size={24} />
            <h1 className="text-xl font-bold">WeatherView</h1>
          </div>
          <div className="text-sm">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>
        
        <div className="p-4 md:p-6">
          <form onSubmit={handleSearch} className="mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Search for a city..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full px-4 py-3 pl-12 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="City search"
              />
              <button 
                type="submit" 
                className="absolute left-3 top-3 text-gray-400"
                aria-label="Search"
              >
                <SearchIcon size={20} />
              </button>
            </div>
          </form>
          
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading weather data...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mx-auto max-w-md">
                <p className="text-red-600 font-medium">{error}</p>
                <p className="text-gray-600 mt-2">Please try searching for a different city.</p>
              </div>
            </div>
          ) : (
            weatherData && (
              <>
                <div className={`bg-gradient-to-r ${getWeatherBackground(weatherData.condition)} rounded-xl p-6 text-white mb-6`}>
                  <div className="flex flex-col md:flex-row justify-between items-center">
                    <div className="mb-4 md:mb-0 text-center md:text-left">
                      <h2 className="text-2xl font-bold">{weatherData.city}, {weatherData.country}</h2>
                      <p className="text-lg capitalize">{weatherData.description}</p>
                      <p className="text-sm opacity-80">
                        Last updated: {new Date(weatherData.dt * 1000).toLocaleTimeString()}
                      </p>
                    </div>
                    
                    <div className="flex items-center">
                      {getWeatherIcon(weatherData.icon, 80)}
                      <div className="ml-4 text-center">
                        <h3 className="text-5xl font-bold">{weatherData.temp}°C</h3>
                        <p className="text-sm">Feels like: {weatherData.feelsLike}°C</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="text-xl font-semibold mb-4">5-Day Forecast</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                    {forecast.map((day, index) => (
                      <div 
                        key={index} 
                        className="bg-blue-50 rounded-lg p-4 text-center shadow-sm hover:shadow-md transition-shadow"
                      >
                        <h4 className="font-medium text-gray-800">{day.day}</h4>
                        <div className="my-2">
                          {getWeatherIcon(day.icon, 40, "mx-auto")}
                        </div>
                        <p className="text-sm text-gray-600 capitalize">
                          {day.description}
                        </p>
                        <div className="flex justify-center space-x-2 mt-2">
                          <span className="font-medium">{day.maxTemp}°</span>
                          <span className="text-gray-500">{day.minTemp}°</span>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 mt-2">
                          <span>{day.humidity}%</span>
                          <span>{day.windSpeed} km/h</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-4">Weather Details</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {[
                      { 
                        label: 'Humidity', 
                        value: `${weatherData.humidity}%`, 
                        icon: <Droplet size={20} className="text-blue-500" />,
                        description: "Percentage of water vapor in the air"
                      },
                      { 
                        label: 'Wind Speed', 
                        value: `${weatherData.windSpeed} km/h`, 
                        icon: <Wind size={20} className="text-blue-500" />,
                        description: "How fast the air is moving"
                      },
                      { 
                        label: 'Pressure', 
                        value: `${weatherData.pressure} hPa`, 
                        icon: <Thermometer size={20} className="text-blue-500" />,
                        description: "Atmospheric pressure"
                      },
                      { 
                        label: 'Visibility', 
                        value: `${weatherData.visibility} km`, 
                        icon: <Sun size={20} className="text-blue-500" />,
                        description: "Distance you can see clearly"
                      },
                      { 
                        label: 'Sunrise', 
                        value: weatherData.sunrise, 
                        icon: <Sun size={20} className="text-yellow-500" />,
                        description: "When the sun rises"
                      },
                      { 
                        label: 'Sunset', 
                        value: weatherData.sunset, 
                        icon: <Moon size={20} className="text-gray-700" />,
                        description: "When the sun sets"
                      },
                    ].map((item, index) => (
                      <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="mr-3">{item.icon}</div>
                        <div>
                          <p className="text-sm text-gray-500">{item.label}</p>
                          <p className="font-medium">{item.value}</p>
                          <p className="text-xs text-gray-400 hidden sm:block">{item.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )
          )}
        </div>
        <div className="bg-gray-50 p-4 border-t border-gray-100 text-center text-sm text-gray-500">
          Weather data provided by OpenWeatherMap
        </div>
      </div>
    </div>
  );
};

export default App;
