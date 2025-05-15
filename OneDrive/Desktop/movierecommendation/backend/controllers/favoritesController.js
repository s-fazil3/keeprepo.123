const User = require('../models/User');
const Movie = require('../models/Movie');

// Get user favorites
exports.getFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('favorites', 'title poster backdrop type')
      .select('favorites');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user.favorites);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add movie to favorites
exports.addFavorite = async (req, res) => {
  try {
    const { movieId } = req.body;

    // Check if movie ID is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(movieId)) {
      return res.status(400).json({ message: 'Invalid movie ID' });
    }

    // Check if movie exists
    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    // Check if movie is already in favorites
    const user = await User.findById(req.user.id);
    if (user.favorites.includes(movieId)) {
      return res.status(400).json({ message: 'Movie already in favorites' });
    }

    // Add movie to favorites
    user.favorites.push(movieId);
    await user.save();

    res.json({ message: 'Movie added to favorites' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Remove movie from favorites
exports.removeFavorite = async (req, res) => {
  try {
    const { movieId } = req.params;

    // Check if movie ID is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(movieId)) {
      return res.status(400).json({ message: 'Invalid movie ID' });
    }

    // Check if movie exists
    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    // Remove movie from favorites
    const user = await User.findById(req.user.id);
    user.favorites = user.favorites.filter(id => id.toString() !== movieId);
    await user.save();

    res.json({ message: 'Movie removed from favorites' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
