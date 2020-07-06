import path from 'path';

import express from 'express';
import cookieParser from 'cookie-parser';

import './controllers';
import { globalErrorHandler } from './controllers';
import { AppRouter, NotFoundError } from './utils';

const app = express();

/****************** GLOBAL MIDDLEWARES ******************/
// Serving static files
app.use(express.static('public'));

// Body parsers
app.use(express.json());
app.use(cookieParser());

/****************** ROUTES ******************/
app.use(AppRouter.instance);
app.all('/api/*', (req, res, next) =>
  next(new NotFoundError('Route not found'))
);
app.get('*', (req, res) => res.redirect(`/#${req.url}`));

/****************** GLOBAL ERROR HANDLER ******************/
app.use(globalErrorHandler);

export { app };
