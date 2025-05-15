const User = require('../models/User');
const jwt = require('jsonwebtoken');


const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};


exports.signup = async (req, res) => {
  try {
    const { username, email, password, confirmPassword } = req.body;


    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }


    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }


    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }


    const user = new User({
      username,
      email,
      password,
      name: username // Using username as name
    });
    await user.save();


    const token = generateToken(user._id);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        username: user.username
      },
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: error.message });
  }
};


exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;


    const user = await User.findByCredentials(email, password);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(user._id);


    console.log('User logged in:', {
      userId: user._id,
      email: user.email
    });

    // eslint-disable-next-line no-unused-vars
    const { password: _, __v: __, ...userData } = user;

    res.json({
      token,
      user: userData
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: error.message });
  }
};
