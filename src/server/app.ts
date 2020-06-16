import express from 'express';

import './controllers';
import { globalErrorHandler } from './controllers';
import { AppRouter, NotFoundError } from './utils';

const app = express();

/****************** GLOBAL MIDDLEWARES ******************/
// Serving static files
app.use(express.static('public'));

// Body parsers
app.use(express.json());

/****************** ROUTES ******************/
app.use(AppRouter.instance);
app.all('*', (req, res, next) => next(new NotFoundError('Page not found')));

/****************** GLOBAL ERROR HANDLER ******************/
app.use(globalErrorHandler);

export { app };
