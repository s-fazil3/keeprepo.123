const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const auth = require('../middleware/auth');
const handleUpload = require('../middleware/upload');

router.use(auth);

router.get('/', profileController.getProfile);
router.post('/', handleUpload, profileController.updateProfile);

module.exports = router;
