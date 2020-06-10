import mongoose from 'mongoose';

if (!process.env.DATABASE_URI) throw new Error('No Database Connection String');

mongoose
  .connect(process.env.DATABASE_URI, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => console.log('Connected to DB'));
