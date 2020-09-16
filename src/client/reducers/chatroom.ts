import { ActionTypes, Action, ChatroomDocClient } from '../utilities';

export const chatroomReducer = (
  state: Record<string, ChatroomDocClient> = {},
  action: Action
): Record<string, ChatroomDocClient> => {
  switch (action.type) {
    case ActionTypes.fetchChatrooms:
      return action.payload;
    case ActionTypes.clearChatrooms:
      return {};
    case ActionTypes.addNewChatroom:
      return { ...state, [action.payload.id]: action.payload };
    case ActionTypes.insertMessage:
      const roomId = `${action.payload.roomId}`;
      const room = state[roomId];
      const messages = {
        ...room.messages,
        [action.payload.id]: action.payload,
      };
      return { ...state, [roomId]: { ...room, messages } };
    default:
      return state;
  }
};
