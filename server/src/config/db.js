import mongoose from "mongoose";
import { config } from "dotenv";

config();

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

// import mongoose from 'mongoose';
// import dotenv from "dotenv";

// dotenv.config();

// export const connectDB = () => {
//   mongoose
//     .connect(process.env.MONGODB_URI)
//     .then(() => console.log('Database successfully connected'))
//     .catch((err) => {
//       console.log(`You have this error ${err}`);
//       console.log('Retrying connection in 5 seconds...');
//       setTimeout(connectDB, 5000);
//     });

//   mongoose.connection.on('connected', () => {
//     console.log('Mongoose connected to DB');
//   });

//   mongoose.connection.on('error', (err) => {
//     console.error(`Mongoose connection error: ${err}`);
//   });

//   mongoose.connection.on('disconnected', () => {
//     console.log('Mongoose disconnected');
//   });

//   process.on('SIGINT', gracefulExit).on('SIGTERM', gracefulExit);

//   function gracefulExit() {
//     mongoose.connection.close(true);
//   }
// };
