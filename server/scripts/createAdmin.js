import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Admin from '../models/admin.model.js';
import config from '../config/config.js';

dotenv.config();

// Connect to MongoDB
mongoose.connect(config.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected for admin creation'))
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

const createInitialAdmin = async () => {
  try {
    const adminExists = await Admin.findOne({ email: 'admin@example.com' });
    
    if (adminExists) {
      console.log('Admin already exists');
      process.exit(0);
    }
    
    const admin = new Admin({
      username: 'admin',
      email: 'admin@example.com',
      password: 'admin123',
      firstName: 'Admin',
      lastName: 'User'
    });
    
    await admin.save();
    console.log('Initial admin created successfully');
    console.log('Username: admin');
    console.log('Email: admin@example.com');
    console.log('Password: admin123');
  } catch (error) {
    console.error('Error creating admin:', error);
  } finally {
    mongoose.disconnect();
    console.log('MongoDB disconnected');
  }
};

createInitialAdmin();
