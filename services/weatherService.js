function createError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

async function getCoordinates(city) {
  const apiKey = process.env.GEOAPIFY_API_KEY;

  if (!apiKey) {
    throw createError('The Geoapify API key is missing. Add it to your .env file first.', 500);
  }

  const firstParams = new URLSearchParams({
    city,
    limit: '1',
    type: 'city',
    lang: 'en',
    apiKey
  });

  const firstUrl = `https://api.geoapify.com/v1/geocode/search?${firstParams.toString()}`;
  let response = await fetch(firstUrl);
  let data = await response.json();

  if (!response.ok) {
    throw createError(`Geoapify request failed (${response.status}). ${data.message || 'Please check your API key.'}`, response.status);
  }

  if (!data.features || data.features.length === 0) {
    const secondParams = new URLSearchParams({
    text: city,
    limit: '1',
    type: 'city',
    lang: 'en',
    apiKey
  });
    const secondUrl = `https://api.geoapify.com/v1/geocode/search?${secondParams.toString()}`;

    response = await fetch(secondUrl);
    data = await response.json();

    if (!response.ok) {
      throw createError(`Geoapify request failed (${response.status}). ${data.message || 'Please check your API key.'}`, response.status);
    }
  }

  if (!data.features || data.features.length === 0) {
    throw createError('City not found. Try a more specific city name.', 404);
  }

  // Geoapify gives us the coordinates we need for the weather API.
  const place = data.features[0].properties;

  return {
    city: place.city || place.name || city,
    country: place.country || '',
    latitude: place.lat,
    longitude: place.lon
  };
}

function getWeatherDescription(code) {
  const descriptions = {
    0: 'Clear sky',
    1: 'Mostly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Foggy',
    48: 'Icy fog',
    51: 'Light drizzle',
    53: 'Drizzle',
    55: 'Heavy drizzle',
    61: 'Light rain',
    63: 'Rain',
    65: 'Heavy rain',
    71: 'Light snow',
    73: 'Snow',
    75: 'Heavy snow',
    80: 'Rain showers',
    81: 'Stronger rain showers',
    82: 'Very strong rain showers',
    95: 'Thunderstorm'
  };

  return descriptions[code] || 'Weather update available';
}

async function getCurrentWeather(latitude, longitude) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m&timezone=auto`;
  const response = await fetch(url);

  if (!response.ok) {
    throw createError('Open-Meteo weather data is not available right now.', 502);
  }

  const data = await response.json();

  if (!data.current) {
    throw createError('Current weather data could not be found.', 404);
  }

  return {
    temperature: data.current.temperature_2m,
    apparentTemperature: data.current.apparent_temperature,
    windSpeed: data.current.wind_speed_10m,
    weatherCode: data.current.weather_code,
    description: getWeatherDescription(data.current.weather_code)
  };
}

async function getWeatherByCity(city) {
  const location = await getCoordinates(city);
  const weather = await getCurrentWeather(location.latitude, location.longitude);

  return {
    city: location.city,
    country: location.country,
    latitude: location.latitude,
    longitude: location.longitude,
    ...weather
  };
}

module.exports = {
  getWeatherByCity
};
