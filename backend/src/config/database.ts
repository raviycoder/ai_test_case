import mongoose from 'mongoose';
import { config } from '.';

let isConnected = false;
let eventsBound = false;

export async function connectToDatabase(): Promise<void> {
  if (isConnected) return;
  try {
    const connectionOptions = {
      autoIndex: config.NODE_ENV !== 'production',
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      dbName: config.DB_NAME,
    } as const;

    await mongoose.connect(config.MONGODB_URI, connectionOptions);
    isConnected = true;

    console.log('✅ MongoDB connected successfully');

    if (!eventsBound) {
      eventsBound = true;
      // Handle connection events
      mongoose.connection.on('error', (error) => {
        console.error('❌ MongoDB connection error:', error);
      });

      mongoose.connection.on('disconnected', () => {
        isConnected = false;
        console.log('🔌 MongoDB disconnected');
      });

      // Handle application termination
      process.on('SIGINT', async () => {
        await mongoose.connection.close();
        console.log('🔌 MongoDB connection closed through app termination');
        process.exit(0);
      });
    }
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    process.exit(1);
  }
}

export async function disconnectFromDatabase(): Promise<void> {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
    isConnected = false;
    console.log('🔌 MongoDB disconnected successfully');
  } catch (error) {
    console.error('❌ Error disconnecting from MongoDB:', error);
  }
}

export function getDatabaseConnectionState(): boolean {
  return isConnected;
}
