import "dotenv/config";

export default {
  PORT: process.env.PORT || 4000,
  NODE_ENV: process.env.NODE_ENV || "development",
  MONGODB_USER: process.env.MONGODB_USER,
  MONGODB_PASSWORD: process.env.MONGODB_PASSWORD,
  MONGODB_URI: process.env.MONGODB_URI || "mongodb://localhost:27017/",
  JWT_SECRET: process.env.JWT_SECRET || "your_jwt_secret_key",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "1d",
};
