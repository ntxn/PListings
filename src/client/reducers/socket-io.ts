import { Action } from '../utilities';

export const socketReducer = (
  state: SocketIOClient.Socket = io(),
  action: Action
): SocketIOClient.Socket => state;
