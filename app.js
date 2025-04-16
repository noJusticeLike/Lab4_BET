const express = require("express");
const hbs = require("hbs");

const app = express();
const PORT = 3000;
const API_KEY = "a091776acdf24b51a88041561230c367";

app.set("view engine", "hbs");
hbs.registerPartials(__dirname + "/views/partials");
app.use(express.static("public"));

const cities = ["Львів", "Тернопіль", "Одеса", "Київ", "Черкаси"];

async function getWeatherData(url) {
  try {
    const response = await fetch(url);
    const weather = await response.json();

    if (parseInt(weather.cod) !== 200) {
      return { error: "Місто не знайдено або дані відсутні" };
    }

    const iconMap = {
      Clouds: "clouds.png",
      Clear: "clear.png",
      Rain: "rain.png",
      Drizzle: "drizzle.png",
      Mist: "mist.png",
      Snow: "snow.png",
    };

    return {
      location: weather.name,
      temperature: Math.round(weather.main.temp),
      feels_like: Math.round(weather.main.feels_like),
      humidity: weather.main.humidity,
      wind_speed: weather.wind.speed,
      description: weather.weather[0].description,
      icon: iconMap[weather.weather[0].main],
    };
  } catch (err) {
    return { error: "Помилка при запиті до API" };
  }
}

app.get("/", (req, res) => {
  res.render("index", {
    cities: cities.map((city) => ({
      name: city,
      url: `/weather/${city}`,
    })),
  });
});

app.get("/weather/:city", async (req, res) => {
  const city = req.params.city;
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric&lang=ua`;

  const weatherData = await getWeatherData(url);
  res.render("weather", { weatherData });
});

app.get("/weather", async (req, res) => {
  const { lat, lon } = req.query;

  if (!lat || !lon) {
    return res.render("weather", {
      error: "Не вдалося визначити координати",
    });
  }

  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=ua`;

  const weatherData = await getWeatherData(url);
  res.render("weather", { weatherData });
});

app.listen(PORT, () => {
  console.log(`Сервер запущено на http://localhost:${PORT}`);
});
