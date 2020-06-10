import express from 'express';

const app = express();

/****************** GLOBAL MIDDLEWARES ******************/
// Serving static files
app.use(express.static('public'));

// Body parsers
app.use(express.json());

/****************** ROUTES ******************/
app.get('/ping', (req, res) => {
  res.send('pong');
});

export { app };
