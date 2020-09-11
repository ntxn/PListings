import { ActionTypes, SavedSocketsAction } from '../utilities';

export const saveSockets = (
  sockets: Record<string, SocketIOClient.Socket>
): SavedSocketsAction => {
  return {
    type: ActionTypes.saveSockets,
    payload: sockets,
  };
};
