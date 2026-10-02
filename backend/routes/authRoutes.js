const express = require('express');
const { register, login, getMe, googleLogin, googleRegister, sendOtp, verifyOtp } = require('../controllers/authController');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/google-login', googleLogin);
router.post('/google-register', googleRegister);
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.get('/me', authMiddleware, getMe);

module.exports = router;

