import { app } from './app';
import socketIO from 'socket.io';

socketIO(app).on('connection', socket => {
  socket.on('chat message', msg => {
    console.log('message: ' + msg);
  });
});
