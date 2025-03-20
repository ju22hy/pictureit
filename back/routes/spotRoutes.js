const express = require('express');
const router = express.Router();
const spotController = require('../controllers/spotController');
const verifyToken = require('../middlewares/middleware');

router.post('/photospot', verifyToken, spotController.addPhotoSpot);
router.get('/photospots', spotController.getPhotoSpots);

module.exports = router;