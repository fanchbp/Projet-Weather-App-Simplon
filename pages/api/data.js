import config from '../../config.json';

//tableau de correspodnance disponible en bas de la page API  (Weather variable documeentation))
const codeTranslation = {
  0: { description: "Clear sky", icon: "01d" },
  1: { description: "Mainly clear", icon: "02d" },
  2: { description: "Partly cloudy", icon: "02d" },
  3: { description: "Overcast", icon: "03d" },
  45: { description: "Fog", icon: "50d" },
  48: { description: "Depositing rime fog", icon: "50d" },
  56: { description: "Light freezing drizzle", icon: "50d" },
  57: { description: "Dense freezing drizzle", icon: "10d" },
  61: { description: "Slight rain", icon: "04d" },
  63: { description: "Moderate rain", icon: "10d" },
  65: { description: "Heavy rain", icon: "10d" },
  66: { description: "Light freezing rain", icon: "04d" },
  67: { description: "Heavy freezing rain", icon: "10d" },
  71: { description: "Slight snow fall", icon: "13d" },
  73: { description: "Moderate snow fall", icon: "13d" },
  75: { description: "Heavy snow fall", icon: "13d" },
  77: { description: "Snow grains", icon: "13d" },
  80: { description: "Slight rain showers", icon: "04d" },
  81: { description: "Moderate rain showers", icon: "10d" },
  82: { description: "Violent rain showers", icon: "10d" },
  85: { description: "Slight snow showers", icon: "13d" },
  86: { description: "Heavy snow showers", icon: "13d" },
  95: { description: "Slight / moderate thunderstorm", icon: "11d" },
  96: { description: "Thunderstorm with slight hail", icon: "11d" },
  99: { description: "Thunderstorm with heavy hail", icon: "11d" },
};

export default async function handler(req, res) {

  //requete API modifier a open-meteo
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${config.latitude}&longitude=${config.longitude}&daily=sunrise,sunset&hourly=visibility&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,wind_direction_10m,weather_code&timezone=auto`;
  
  try {
    //recuperations de toutes les données nécessaire pour la page index
    const getWeatherData = await fetch(url);    
    const data = await getWeatherData.json();
    const code = data.current.weather_code;
    const weather = codeTranslation[code];
    const OpenMeteoData = {
      name: config.city, 
      dt: Math.floor(Date.now() / 1000), 
      timezone: data.utc_offset_seconds,
      sys: {
        country: config.country, 
        sunrise: Math.floor(new Date(data.daily.sunrise[0]).getTime() / 1000),
        sunset: Math.floor(new Date(data.daily.sunset[0]).getTime() / 1000)
      },
      main: { 
        temp: data.current.temperature_2m,
        feels_like: data.current.apparent_temperature,
        humidity: data.current.relative_humidity_2m,        
      },
      visibility:data.hourly.visibility[0],
      weather: [
      { 
        description: weather.description, 
        icon: weather.icon 
      }
    ],
      wind: { 
        speed: data.current.wind_speed_10m, 
        deg: data.current.wind_direction_10m 
      }
    };
    res.status(200).json(OpenMeteoData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur chargement API" });
  }
}