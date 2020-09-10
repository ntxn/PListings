import express from 'express';
import http from 'http';
import cookieParser from 'cookie-parser';

import './controllers';
import { globalErrorHandler } from './controllers';
import { AppRouter, NotFoundError } from './utils';

const expressApp = express();

/****************** GLOBAL MIDDLEWARES ******************/
// Serving static files
expressApp.use(express.static('public'));

// Body parsers
expressApp.use(express.json());
expressApp.use(cookieParser());

/****************** ROUTES ******************/
expressApp.use(AppRouter.instance);
expressApp.all('/api/*', (req, res, next) =>
  next(new NotFoundError('Route not found'))
);
expressApp.get('*', (req, res) => res.redirect(`/#${req.url}`));

/****************** GLOBAL ERROR HANDLER ******************/
expressApp.use(globalErrorHandler);

export const app = http.createServer(expressApp);
