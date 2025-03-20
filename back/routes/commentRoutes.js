const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const verifyToken = require('../middlewares/middleware');

router.post('/comment', verifyToken, commentController.addComment);
router.get('/comments/:point_id', commentController.getComments);

module.exports = router;