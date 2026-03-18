import { mockWeatherData } from './mockData';

const API_KEY = import.meta.env.VITE_WEATHER_API_KEY || ''; 
const BASE_URL = '/api';

const transformWeatherData = (current, forecast) => {
  // Hourly: next 8 timestamps (24 hours)
  const hourly = forecast.list.slice(0, 8).map(item => ({
    dt: item.dt,
    temp: item.main.temp,
    weather: item.weather
  }));

  // Daily: Group by day, take min/max
  const dailyMap = {};
  forecast.list.forEach(item => {
    const date = new Date(item.dt * 1000).toISOString().split('T')[0];
    if (!dailyMap[date]) {
      dailyMap[date] = { 
        min: item.main.temp_min, 
        max: item.main.temp_max, 
        weather: item.weather, 
        dt: item.dt 
      };
    } else {
      dailyMap[date].min = Math.min(dailyMap[date].min, item.main.temp_min);
      dailyMap[date].max = Math.max(dailyMap[date].max, item.main.temp_max);
    }
  });

  const daily = Object.values(dailyMap).slice(0, 5).map(day => ({
    dt: day.dt,
    temp: { min: day.min, max: day.max },
    weather: day.weather
  }));

  return {
    current: {
      ...current.main,
      wind_speed: current.wind.speed,
      visibility: current.visibility,
      sunrise: current.sys.sunrise,
      sunset: current.sys.sunset,
      weather: current.weather,
      name: current.name,
      dt: current.dt,
      uvi: current.uvi || 5.0, // OpenWeatherMap free tier /weather endpoint still lacks UVI sometimes
      feels_like: current.main.feels_like
    },
    hourly,
    daily
  };
};

export const getWeatherData = async (city) => {
  try {
    const currentRes = await fetch(`${BASE_URL}/weather?city=${city}`);
    if (!currentRes.ok) {
      const errorData = await currentRes.json();
      throw new Error(errorData.error || 'City not found');
    }
    const current = await currentRes.json();

    const forecastRes = await fetch(`${BASE_URL}/forecast?city=${city}`);
    const forecast = await forecastRes.json();

    return transformWeatherData(current, forecast);
  } catch (error) {
    console.error("Error fetching weather:", error);
    // Fallback to mock data only if specifically needed, but user wants real data
    throw error;
  }
};


export const getWeatherDataByCoords = async (lat, lon) => {
  try {
    const currentRes = await fetch(`${BASE_URL}/weather?lat=${lat}&lon=${lon}`);
    if (!currentRes.ok) throw new Error('Location not found');
    const current = await currentRes.json();

    const forecastRes = await fetch(`${BASE_URL}/forecast?lat=${lat}&lon=${lon}`);
    const forecast = await forecastRes.json();

    return transformWeatherData(current, forecast);
  } catch (error) {
    console.error("Error fetching weather by coords:", error);
    throw error;
  }
};
