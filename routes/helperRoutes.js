const express = require('express');

const { getWeatherByCity } = require('../services/weatherService');
const { getBooksByCategory } = require('../services/bookService');

const router = express.Router();

// These routes support the website interface.
// The app is still a website first, not an API-only project.
router.get('/weather', async (req, res) => {
  const city = req.query.city ? req.query.city.trim() : '';

  if (!city) {
    return res.status(400).json({
      error: 'Please enter a city name first.'
    });
  }

  try {
    const weather = await getWeatherByCity(city);
    res.json(weather);
  } catch (error) {
    res.status(error.statusCode || 500).json({
      error: error.message || 'Weather data could not be loaded.'
    });
  }
});

router.get('/resources', async (req, res) => {
  const category = req.query.category ? req.query.category.trim() : '';

  if (!category) {
    return res.status(400).json({
      error: 'A task category is needed before books can be loaded.'
    });
  }

  try {
    const books = await getBooksByCategory(category);
    res.json({
      category,
      books
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      error: error.message || 'Book data could not be loaded.'
    });
  }
});

module.exports = router;
