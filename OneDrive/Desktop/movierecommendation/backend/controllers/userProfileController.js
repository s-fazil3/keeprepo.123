const UserProfile = require('../models/UserProfile');
const User = require('../models/User');

// Create or update user profile
exports.createOrUpdateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const profileData = req.body;

    // Find or create profile
    let profile = await UserProfile.findOneAndUpdate(
      { userId },
      { $set: profileData },
      { new: true, upsert: true, runValidators: true }
    );

    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const profile = await UserProfile.findOne({ userId })
      .populate('favoriteMovies', 'title poster backdrop type')
      .populate('watchlist', 'title poster backdrop type');

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add movie to favorites
exports.addFavoriteMovie = async (req, res) => {
  try {
    const userId = req.user.id;
    const { movieId } = req.body;

    // Check if movie ID is valid
    if (!mongoose.Types.ObjectId.isValid(movieId)) {
      return res.status(400).json({ message: 'Invalid movie ID' });
    }

    const profile = await UserProfile.findOne({ userId });
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    // Check if movie is already in favorites
    if (profile.favoriteMovies.includes(movieId)) {
      return res.status(400).json({ message: 'Movie already in favorites' });
    }

    // Add movie to favorites
    profile.favoriteMovies.push(movieId);
    await profile.save();

    res.json({ message: 'Movie added to favorites' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Remove movie from favorites
exports.removeFavoriteMovie = async (req, res) => {
  try {
    const userId = req.user.id;
    const { movieId } = req.params;

    // Check if movie ID is valid
    if (!mongoose.Types.ObjectId.isValid(movieId)) {
      return res.status(400).json({ message: 'Invalid movie ID' });
    }

    const profile = await UserProfile.findOne({ userId });
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    // Remove movie from favorites
    profile.favoriteMovies = profile.favoriteMovies.filter(
      id => id.toString() !== movieId
    );
    await profile.save();

    res.json({ message: 'Movie removed from favorites' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add movie to watchlist
exports.addToWatchlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { movieId } = req.body;

    // Check if movie ID is valid
    if (!mongoose.Types.ObjectId.isValid(movieId)) {
      return res.status(400).json({ message: 'Invalid movie ID' });
    }

    const profile = await UserProfile.findOne({ userId });
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    // Check if movie is already in watchlist
    if (profile.watchlist.includes(movieId)) {
      return res.status(400).json({ message: 'Movie already in watchlist' });
    }

    // Add movie to watchlist
    profile.watchlist.push(movieId);
    await profile.save();

    res.json({ message: 'Movie added to watchlist' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Remove movie from watchlist
exports.removeFromWatchlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { movieId } = req.params;

    // Check if movie ID is valid
    if (!mongoose.Types.ObjectId.isValid(movieId)) {
      return res.status(400).json({ message: 'Invalid movie ID' });
    }

    const profile = await UserProfile.findOne({ userId });
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    // Remove movie from watchlist
    profile.watchlist = profile.watchlist.filter(
      id => id.toString() !== movieId
    );
    await profile.save();

    res.json({ message: 'Movie removed from watchlist' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
