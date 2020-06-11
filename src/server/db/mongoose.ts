import mongoose from 'mongoose';
import { mongoDbOptions } from '../../common';

if (!process.env.DATABASE_URI) throw new Error('No Database Connection String');

mongoose
  .connect(process.env.DATABASE_URI, mongoDbOptions)
  .then(() => console.log('Connected to DB'));
