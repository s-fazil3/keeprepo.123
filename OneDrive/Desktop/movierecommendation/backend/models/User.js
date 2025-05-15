const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Import the Movie model
require('./Movie');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 50
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
    index: true
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
    maxlength: 100
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  phone: {
    type: String,
    trim: true,
    maxlength: 20,
    default: ''
  },
  address: {
    type: String,
    trim: true,
    maxlength: 200,
    default: ''
  },
  photo: {
    type: String,
    default: '',
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (this.isModified('password')) {
    try {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    } catch (error) {
      console.error('Password hashing error:', error);
      return next(error);
    }
  }
  
  // Update timestamps
  this.updatedAt = Date.now();
  
  next();
});

// Validate email uniqueness when updating
userSchema.pre('findOneAndUpdate', async function(next) {
  const update = this.getUpdate();
  
  // If email is being updated, check for uniqueness
  if (update.email) {
    try {
      const user = await this.model.findOne({ email: update.email });
      if (user && user._id.toString() !== this._conditions._id.toString()) {
        const error = new Error('Email already in use');
        error.name = 'ValidationError';
        return next(error);
      }
    } catch (error) {
      return next(error);
    }
  }
  
  // Update the updatedAt timestamp
  if (!update.$set) update.$set = {};
  update.$set.updatedAt = Date.now();
  
  next();
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    console.error('Password comparison error:', error);
    throw error;
  }
};

// Indexes
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ username: 1 });

// Enable virtuals in toJSON output
userSchema.set('toJSON', { 
  transform: function(doc, ret) {
    delete ret.__v;
    delete ret.password;
    return ret;
  }
});

userSchema.set('toObject', { 
  transform: function(doc, ret) {
    delete ret.__v;
    delete ret.password;
    return ret;
  }
});

// Static methods
userSchema.statics.findByCredentials = async (email, password) => {
  try {
    // Find user by email
    const user = await User.findOne({ email });
    
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Check if password matches
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new Error('Invalid email or password');
    }

    // Convert to plain object and remove sensitive data
    const userObject = user.toObject ? user.toObject() : user;
    delete userObject.password;
    delete userObject.__v;
    
    return userObject;
  } catch (error) {
    console.error('Error in findByCredentials:', error);
    throw error; // Re-throw the error to be handled by the caller
  }
};

const User = mongoose.model('User', userSchema);
module.exports = User;
