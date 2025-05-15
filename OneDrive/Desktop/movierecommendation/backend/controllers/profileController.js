const User = require('../models/User');

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    // Get the user
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Convert to plain object
    const userObj = user.toObject();

    // Format photo URL if it exists and is a relative path
    let photoUrl = userObj.photo || '';
    if (photoUrl && !photoUrl.startsWith('http')) {
      photoUrl = `http://localhost:3000${photoUrl}`;
    }
    
    // Return the user profile data
    const profileData = {
      name: userObj.name,
      email: userObj.email,
      phone: userObj.phone || '',
      address: userObj.address || '',
      photo: photoUrl
    };
    
    console.log('Returning profile data:', profileData);

    res.json(profileData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    console.log('Update profile request body:', req.body);
    
    // Get updates from request body
    const updates = Object.keys(req.body).filter(key => key !== 'photo');
    const allowedUpdates = ['name', 'email', 'phone', 'address', 'photo'];
    
    // If there's a file in the request, add it to the updates
    if (req.file) {
      updates.push('photo');
      req.body.photo = req.body.photo; // This is set by the upload middleware
    }
    
    console.log('Requested updates:', updates);
    
    // Validate updates
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));
    if (!isValidOperation) {
      console.error('Invalid updates requested');
      return res.status(400).json({ message: 'Invalid updates' });
    }

    // Build update object
    const updateObj = {};
    updates.forEach(update => {
      if (req.body[update] !== undefined) {
        console.log(`Updating ${update} to:`, req.body[update]);
        // Ensure photo URL is properly formatted
        if (update === 'photo' && req.body.photo && !req.body.photo.startsWith('http')) {
          // If it's a relative path, make it absolute
          updateObj.photo = `http://localhost:3000${req.body.photo}`;
          console.log('Formatted photo URL:', updateObj.photo);
        } else {
          updateObj[update] = req.body[update];
        }
      }
    });

    console.log('Attempting to update user with ID:', req.user.id);
    console.log('Update object:', updateObj);
    
    // Find and update the user in one operation
    const updatedUser = await User.findOneAndUpdate(
      { _id: req.user.id },
      { $set: updateObj },
      { new: true, runValidators: true, context: 'query' }
    ).select('-password -__v');
    
    console.log('Update operation completed, result:', updatedUser);
    
    if (!updatedUser) {
      console.error('User not found after update attempt:', req.user.id);
      return res.status(404).json({ message: 'User not found' });
    }
    
    console.log('User updated successfully:', {
      id: updatedUser._id,
      email: updatedUser.email,
      updatedFields: updates
    });
    
    // Prepare response data
    const responseData = {
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone || '',
      address: updatedUser.address || '',
      photo: updatedUser.photo || ''
    };
    
    console.log('Sending response data:', responseData);
    
    // Send back the updated user data
    res.json(responseData);
  } catch (error) {
    console.error('Error in updateProfile:', {
      message: error.message,
      name: error.name,
      code: error.code,
      errors: error.errors,
      stack: error.stack
    });
    
    // Handle duplicate email error
    if (error.code === 11000 || error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: error.message || 'Validation error',
        field: error.keyValue ? Object.keys(error.keyValue)[0] : undefined,
        details: error.errors
      });
    }
    
    // Handle other errors
    res.status(500).json({ 
      message: 'Something went wrong while updating your profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
