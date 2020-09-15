import { ActionTypes, AddSocketsAction } from '../utilities';

export const addSockets = (
  sockets: Record<string, SocketIOClient.Socket>
): AddSocketsAction => {
  return {
    type: ActionTypes.addSockets,
    payload: sockets,
  };
};
