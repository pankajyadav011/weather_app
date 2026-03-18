const axios = require('axios');

module.exports = async (req, res) => {
  const { city, lat, lon, units = 'metric' } = req.query;
  const API_KEY = process.env.OPENWEATHER_API_KEY;

  if (!API_KEY) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    let url;
    if (lat && lon) {
      url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=${units}&appid=${API_KEY}`;
    } else if (city) {
      url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=${units}&appid=${API_KEY}`;
    } else {
      return res.status(400).json({ error: 'City or coordinates are required' });
    }

    const response = await axios.get(url);
    res.status(200).json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({ 
      error: error.response?.data?.message || 'Error fetching forecast data' 
    });
  }
};
