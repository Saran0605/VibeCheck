const mongoose = require('mongoose');
const dns = require('dns');

// Set DNS servers to resolve MongoDB Atlas SRV records on networks/Windows where default DNS fails querySrv
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  console.warn('[Database] Could not set custom DNS servers:', e.message);
}

const connectDB = async () => {
  try {
    const connStr = process.env.MONGODB_URI || 'mongodb://localhost:27017/VibeCheck';
    console.log(`[Database] Connecting to MongoDB...`);
    const conn = await mongoose.connect(connStr);
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[Database] Error connecting to MongoDB: ${error.message}`);
    // Do not exit process in dev mode if DB fails initially, but log error
  }
};

module.exports = connectDB;

