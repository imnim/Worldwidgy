import { timezoneCoordinates, TimezoneCoord } from '../data/timezonesWithCoords';

export type WeatherData = {
  city: string;
  temperature: number; // in Celsius
  condition: 'Sunny' | 'Cloudy' | 'Rainy' | 'Snowy' | 'Thunderstorm';
};

// A simple pseudo-random number generator for deterministic results based on seed
const pseudoRandom = (seed: number) => {
  let x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

// Mock function to "fetch" weather data
export const getWeatherForTimezone = async (timezone: string): Promise<WeatherData | null> => {
  const location = timezoneCoordinates[timezone];
  
  if (!location) {
    console.warn(`No coordinates found for timezone: ${timezone}`);
    return null;
  }

  // Simulate network delay
  await new Promise(res => setTimeout(res, 500 + Math.random() * 800));

  // Use location to generate somewhat deterministic but varied weather
  const seed = location.lat + location.lon + new Date().getDate(); // Daily seed
  const random = pseudoRandom(seed);

  const conditions: WeatherData['condition'][] = ['Sunny', 'Cloudy', 'Rainy', 'Thunderstorm', 'Snowy'];
  
  // Determine temperature based on latitude (very simplified)
  const tempMod = Math.abs(location.lat) / 90; // 0 at equator, 1 at poles
  const baseTemp = 30 * (1 - tempMod); // 30°C at equator
  const seasonalVariation = Math.sin((new Date().getMonth() / 12) * 2 * Math.PI) * 10; // Simple seasonal swing
  const temperature = Math.round(baseTemp - seasonalVariation + (random * 10 - 5));

  let condition: WeatherData['condition'];

  // Determine condition based on temperature and randomness
  if (temperature <= 0 && random > 0.5) {
    condition = 'Snowy';
  } else if (temperature < 15 && random > 0.7) {
    condition = 'Rainy';
  } else if (random > 0.85) {
    condition = 'Thunderstorm';
  } else if (random > 0.5) {
    condition = 'Cloudy';
  } else {
    condition = 'Sunny';
  }

  return {
    city: location.city,
    temperature,
    condition,
  };
};