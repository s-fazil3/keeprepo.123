const axios = require('axios');

// Get popular movies from TMDB
exports.getPopularMovies = async (req, res) => {
  try {
    const apiKey = process.env.TMDB_API_KEY;
    const response = await axios.get(`https://api.themoviedb.org/3/movie/popular`, {
      params: {
        api_key: apiKey,
        language: 'en-US',
        page: 1
      }
    });

    res.json(response.data.results);
  } catch (error) {
    console.error('Error fetching movies:', error);
    res.status(500).json({ message: 'Error fetching movies' });
  }
};
