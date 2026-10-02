const express = require('express');
const { 
  updateProfile, getAllCreators, getCreatorById, 
  getCreatorProfileMe, uploadAvatar, deleteAvatar,
  uploadPortfolioVideo, deletePortfolioVideo 
} = require('../controllers/creatorController');
const { authMiddleware, checkRole } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/uploadMiddleware');

const router = express.Router();

router.get('/me', authMiddleware, getCreatorProfileMe);
router.get('/', getAllCreators);
router.get('/:id', getCreatorById);

// Requires Authentication and Creator Role
router.post('/profile', authMiddleware, checkRole('creator'), updateProfile);
router.put('/profile', authMiddleware, checkRole('creator'), updateProfile);
router.post('/avatar', authMiddleware, checkRole('creator'), upload.single('profilePicture'), uploadAvatar);
router.delete('/avatar', authMiddleware, checkRole('creator'), deleteAvatar);
router.post('/portfolio-video', authMiddleware, checkRole('creator'), upload.single('video'), uploadPortfolioVideo);
router.delete('/portfolio-video/:fileId', authMiddleware, checkRole('creator'), deletePortfolioVideo);

module.exports = router;
