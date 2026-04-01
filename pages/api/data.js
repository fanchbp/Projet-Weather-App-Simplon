import config from '../../config.json';


const weatherMapping = {
  0: { main: "Clear", description: "Ciel dégagé", icon: "01d" },
  1: { main: "Clear", description: "Principalement dégagé", icon: "01d" },
  2: { main: "Clouds", description: "Partiellement nuageux", icon: "02d" },
  3: { main: "Clouds", description: "Couvert", icon: "03d" },
  45: { main: "Fog", description: "Brouillard", icon: "50d" },
  61: { main: "Rain", description: "Pluie légère", icon: "10d" },
};

export default async function handler(req, res) {
  const { latitude, longitude, cityName, countryCode } = config;

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&hourly=relative_humidity_2m,visibility&daily=sunrise,sunset&timezone=auto`;
  
  try {
    const response = await fetch(url);
    
    const data = await response.json();

    const code = data.current_weather.weathercode;
    const weatherStatus = weatherMapping[code] || { main: "Clouds", description: "Nuageux", icon: "03d" };
    const currentVisibility = data.hourly?.visibility ? data.hourly.visibility[0] : 10000;
    const formattedData = {
      name: cityName, 
      dt: Math.floor(Date.now() / 1000), 
      timezone: data.utc_offset_seconds,
      sys: {
        country: countryCode, 
        sunrise: Math.floor(new Date(data.daily.sunrise[0]).getTime() / 1000),
        sunset: Math.floor(new Date(data.daily.sunset[0]).getTime() / 1000)
      },
      main: { 
        temp: data.current_weather.temperature,
        feels_like: data.current_weather.temperature,
        humidity: data.hourly.relative_humidity_2m[0],
        //pressure: 1013,
        visibility: currentVisibility
      },
      weather: [
      { 
        main: weatherStatus.main, 
        description: weatherStatus.description, 
        icon: weatherStatus.icon 
      }
    ],
      wind: { 
        speed: data.current_weather.windspeed, 
        //deg: data.current_weather.winddirection 
      }
    };
    res.status(200).json(formattedData);
  } catch (error) {
    res.status(500).json({ message: "Erreur chargement API" });
  }
}