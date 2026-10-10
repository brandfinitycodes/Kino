const User = require('../models/User');
const CreatorProfile = require('../models/CreatorProfile');
const BrandProfile = require('../models/BrandProfile');
const KycProfile = require('../models/KycProfile');
const Otp = require('../models/Otp');
const sendEmail = require('../utils/sendEmail');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


const register = async (req, res) => {
  const { email, password, role, name, businessName } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ email, password: hashedPassword, role });
    await newUser.save();

    // Auto-create profile based on role
    let profileId = null;
    if (role === 'creator') {
      const newCreator = new CreatorProfile({
        userId: newUser._id,
        name: name || `Creator-${newUser._id.toString().substring(newUser._id.toString().length - 4)}`,
        bio: null,
        niche: null
      });
      await newCreator.save();
      profileId = newCreator._id;
    } else if (role === 'brand') {
      const newBrand = new BrandProfile({
        userId: newUser._id,
        businessName: businessName || name || `Brand-${newUser._id.toString().substring(newUser._id.toString().length - 4)}`,
        description: null
      });
      await newBrand.save();
      profileId = newBrand._id;
    }

    const token = jwt.sign({ id: newUser._id, role: newUser.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.status(201).json({ token, user: { id: newUser._id, email: newUser.email, role: newUser.role, name: role === 'creator' ? name : businessName, profileId, kycStatus: 'NOT_STARTED' } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email }).lean();
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isSuspended) {
      return res.status(403).json({ message: 'Your account has been suspended by the administrator.' });
    }


    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });

    let name = null;
    let profilePicture = null;
    let logo = null;
    let profileId = null;
    
    if (user.role === 'creator') {
      const profile = await CreatorProfile.findOne({ userId: user._id }).lean();
      if (profile) {
        name = profile.name;
        profilePicture = profile.profilePicture;
        profileId = profile._id;
      }
    } else if (user.role === 'brand') {
      const profile = await BrandProfile.findOne({ userId: user._id }).lean();
      if (profile) {
        name = profile.businessName;
        logo = profile.logo;
        profileId = profile._id;
      }
    }

    const kyc = await KycProfile.findOne({ userId: user._id }).lean();

    res.json({ 
      token, 
      user: { 
        id: user._id, 
        email: user.email, 
        role: user.role,
        name,
        profilePicture,
        logo,
        profileId,
        kycStatus: kyc ? kyc.status : 'NOT_STARTED'
      } 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password').lean();
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.isSuspended) {
      return res.status(403).json({ message: 'Your account has been suspended by the administrator.' });
    }


    if (user.role === 'creator') {
      const profile = await CreatorProfile.findOne({ userId: user._id }).lean();
      if (profile) {
        user.name = profile.name;
        user.profilePicture = profile.profilePicture;
        user.profileId = profile._id;
      }
    } else if (user.role === 'brand') {
      const profile = await BrandProfile.findOne({ userId: user._id }).lean();
      if (profile) {
        user.name = profile.businessName;
        user.logo = profile.logo;
        user.profileId = profile._id;
      }
    }

    const kyc = await KycProfile.findOne({ userId: user._id }).lean();
    user.kycStatus = kyc ? kyc.status : 'NOT_STARTED';

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const googleLogin = async (req, res) => {
  const { idToken } = req.body;
  if (!idToken) {
    return res.status(400).json({ message: 'Google ID token is required' });
  }

  try {
    // Verify ID Token via Google API
    const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`);
    if (!response.ok) {
      return res.status(400).json({ message: 'Invalid Google token' });
    }

    const payload = await response.json();
    const { email, email_verified } = payload;

    if (!email_verified || email_verified === 'false') {
      return res.status(400).json({ message: 'Google email is not verified' });
    }

    // Check aud matches GOOGLE_CLIENT_ID if configured
    if (process.env.GOOGLE_CLIENT_ID && payload.aud !== process.env.GOOGLE_CLIENT_ID) {
      return res.status(400).json({ message: 'Audience mismatch: invalid client ID' });
    }

    // Find User
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'No account associated with this Google email. Please register first.' });
    }

    if (user.isSuspended) {
      return res.status(403).json({ message: 'Your account has been suspended by the administrator.' });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
    const kyc = await KycProfile.findOne({ userId: user._id }).lean();
    
    let profileId = null;
    if (user.role === 'creator') {
      const profile = await CreatorProfile.findOne({ userId: user._id }).lean();
      if (profile) profileId = profile._id;
    } else if (user.role === 'brand') {
      const profile = await BrandProfile.findOne({ userId: user._id }).lean();
      if (profile) profileId = profile._id;
    }

    res.json({ token, user: { id: user._id, email: user.email, role: user.role, profileId, kycStatus: kyc ? kyc.status : 'NOT_STARTED' } });
  } catch (error) {
    console.error('Google Login Error:', error);
    res.status(500).json({ message: error.message });
  }
};

const googleRegister = async (req, res) => {
  const { idToken, role } = req.body;
  if (!idToken || !role) {
    return res.status(400).json({ message: 'Google ID token and role are required' });
  }

  if (!['creator', 'brand'].includes(role)) {
    return res.status(400).json({ message: 'Invalid role specified' });
  }

  try {
    // Verify ID Token via Google API
    const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`);
    if (!response.ok) {
      return res.status(400).json({ message: 'Invalid Google token' });
    }

    const payload = await response.json();
    const { email, email_verified, name, picture } = payload;

    if (!email_verified || email_verified === 'false') {
      return res.status(400).json({ message: 'Google email is not verified' });
    }

    // Check aud matches GOOGLE_CLIENT_ID if configured
    if (process.env.GOOGLE_CLIENT_ID && payload.aud !== process.env.GOOGLE_CLIENT_ID) {
      return res.status(400).json({ message: 'Audience mismatch: invalid client ID' });
    }

    // Check if user already exists
    let user = await User.findOne({ email });
    let isNewUser = false;
    let profileId = null;

    if (user && user.isSuspended) {
      return res.status(403).json({ message: 'Your account has been suspended by the administrator.' });
    }

    if (!user) {
      isNewUser = true;
      // Register new user
      // Create a dummy bcrypt-hashed password since we're using Google
      const dummyPassword = Math.random().toString(36).slice(-10);
      const hashedPassword = await bcrypt.hash(dummyPassword, 10);
      
      user = new User({ email, password: hashedPassword, role });
      await user.save();

      // Create corresponding Profile immediately with Google info
      const displayName = name || `User-${user._id.toString().substring(user._id.toString().length - 4)}`;
      const displayPicture = picture || '';

      if (role === 'creator') {
        const creatorProfile = new CreatorProfile({
          userId: user._id,
          name: displayName,
          profilePicture: displayPicture,
          bio: null,
          niche: null
        });
        await creatorProfile.save();
        profileId = creatorProfile._id;
      } else if (role === 'brand') {
        const brandProfile = new BrandProfile({
          userId: user._id,
          businessName: displayName,
          logo: displayPicture,
          description: null
        });
        await brandProfile.save();
        profileId = brandProfile._id;
      }
    } else {
      if (user.role === 'creator') {
        const profile = await CreatorProfile.findOne({ userId: user._id }).lean();
        if (profile) profileId = profile._id;
      } else if (user.role === 'brand') {
        const profile = await BrandProfile.findOne({ userId: user._id }).lean();
        if (profile) profileId = profile._id;
      }
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
    let kycStatus = 'NOT_STARTED';
    if (!isNewUser) {
      const kyc = await KycProfile.findOne({ userId: user._id }).lean();
      if (kyc) kycStatus = kyc.status;
    }

    res.json({ token, user: { id: user._id, email: user.email, role: user.role, profileId, kycStatus } });
  } catch (error) {
    console.error('Google Register Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Send Email OTP
const sendOtp = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: 'Email address is required' });
  }

  try {
    const cleanEmail = email.toLowerCase().trim();
    
    // Phase 2: Duplicate Check
    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      // User requested to show "Invalid credentials" instead of "Email already in use" to prevent account enumeration
      return res.status(400).json({ message: 'Invalid credentials. Please try again or log in.' });
    }

    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();

    await Otp.deleteMany({ email: cleanEmail });

    const otpDoc = new Otp({ email: cleanEmail, otp: generatedOtp });
    await otpDoc.save();

    // REAL EMAIL SENDING DISABLED FOR TESTING
    // Simply returning the devOtp to the frontend
    console.log(`[DEV MODE] OTP generated for ${cleanEmail}: ${generatedOtp}`);

    res.json({
      message: 'Verification OTP generated for testing.',
      email: cleanEmail,
      devOtp: generatedOtp
    });
  } catch (error) {
    console.error('Send OTP Error:', error);
    res.status(500).json({ message: 'Failed to generate verification OTP. Please try again.' });
  }
};

// Verify Email OTP
const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.status(400).json({ message: 'Email and 6-digit OTP are required' });
  }

  try {
    const cleanEmail = email.toLowerCase().trim();
    const cleanOtp = otp.toString().trim();

    const record = await Otp.findOne({ email: cleanEmail, otp: cleanOtp });
    if (!record) {
      return res.status(400).json({ message: 'Invalid or expired verification OTP. Please check and try again.' });
    }

    await Otp.deleteMany({ email: cleanEmail });

    res.json({ success: true, message: 'Email verified successfully.' });
  } catch (error) {
    console.error('Verify OTP Error:', error);
    res.status(500).json({ message: 'OTP verification failed.' });
  }
};

module.exports = { register, login, getMe, googleLogin, googleRegister, sendOtp, verifyOtp };


