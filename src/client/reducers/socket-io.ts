import { Action, ActionTypes } from '../utilities';

export const socketReducer = (
  state: Record<string, SocketIOClient.Socket> = { default: io() },
  action: Action
): Record<string, SocketIOClient.Socket> => {
  switch (action.type) {
    case ActionTypes.saveSockets:
      return { ...state, ...action.payload };
    default:
      return state;
  }
};
