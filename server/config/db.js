import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongod = null;

/**
 * Connect to MongoDB using the MONGO_URI environment variable.
 * If local MongoDB is not running, falls back to mongodb-memory-server.
 * Logs connection status. Does NOT exit on failure so the server
 * can still start and serve a helpful error response.
 */
const connectDB = async () => {
  let dbUrl = process.env.MONGO_URI || 'mongodb://localhost:27017/findash';
  const isLocalhost = dbUrl.includes('localhost') || dbUrl.includes('127.0.0.1') || dbUrl.includes('::1');

  try {
    console.log(`🔍 Attempting to connect to database...`);
    const conn = await mongoose.connect(dbUrl, {
      serverSelectionTimeoutMS: 2000, // Quick timeout to check if available
    });
    console.log(`✅ MongoDB connected successfully: ${conn.connection.host}`);
  } catch (error) {
    if (isLocalhost) {
      console.log('⚠️  Local MongoDB connection failed.');
      console.log('🚀 Starting zero-config in-memory MongoDB fallback server (using lightweight v4.4.29)...');
      try {
        mongod = await MongoMemoryServer.create({
          binary: {
            version: '4.4.29',
          }
        });
        const inMemoryUri = mongod.getUri();
        console.log(`ℹ️  Spun up in-memory MongoDB at ${inMemoryUri}`);
        
        // Disconnect any failed attempt before reconnecting
        await mongoose.disconnect();
        
        const conn = await mongoose.connect(inMemoryUri, {
          serverSelectionTimeoutMS: 5000,
        });
        console.log(`✅ MongoDB connected successfully (In-Memory): ${conn.connection.host}`);
      } catch (memServerErr) {
        console.error(`❌ Failed to start/connect to in-memory MongoDB server: ${memServerErr.message}`);
      }
    } else {
      console.error(`❌ MongoDB connection failed: ${error.message}`);
      console.error('   Make sure your cloud Atlas credentials or server configurations are correct.');
    }
  }

  // Log when the connection is lost after initial success
  mongoose.connection.on('disconnected', () => {
    console.warn('⚠️  MongoDB disconnected. Attempting to reconnect...');
  });

  // Log reconnection
  mongoose.connection.on('reconnected', () => {
    console.log('✅ MongoDB reconnected');
  });

  // Handle unexpected errors on the connection
  mongoose.connection.on('error', (err) => {
    console.error(`❌ MongoDB error: ${err.message}`);
  });
};

export default connectDB;
