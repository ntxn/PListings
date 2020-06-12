import express from 'express';

import './controllers';
import { AppRouter } from './utils';

const app = express();

/****************** GLOBAL MIDDLEWARES ******************/
// Serving static files
app.use(express.static('public'));

// Body parsers
app.use(express.json());

/****************** ROUTES ******************/
app.use(AppRouter.instance);

export { app };
