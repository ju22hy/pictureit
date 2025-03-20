const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const verifyToken = require('../middlewares/middleware');

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/logout', verifyToken , authController.logout);

// 리프레시 토큰을 사용해 새로운 액세스 토큰 발급
router.post('/refresh', authController.refreshAccessToken);

module.exports = router;