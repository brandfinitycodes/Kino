const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

const seedAdmin = async () => {
  const email = process.argv[2] || 'admin@influencerhub.com';
  const password = process.argv[3] || 'AdminSecurePassword123';

  if (!process.env.MONGODB_URI) {
    console.error('Error: MONGODB_URI is not set in backend/.env file.');
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB.');

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log(`User with email ${email} already exists. Updating role to 'admin'...`);
      existingUser.role = 'admin';
      await existingUser.save();
      console.log('User role updated to admin successfully.');
      process.exit(0);
    }

    console.log(`Creating new admin user: ${email}...`);
    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = new User({
      email,
      password: hashedPassword,
      role: 'admin'
    });

    await newAdmin.save();
    console.log(`Admin user created successfully!\nEmail: ${email}\nPassword: ${password}`);
    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin user:', error);
    process.exit(1);
  }
};

seedAdmin();
