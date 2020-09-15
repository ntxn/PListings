import { ActionTypes, Action } from '../utilities';
import { ChatroomDoc } from '../../common';

export const chatroomReducer = (
  state: Record<string, ChatroomDoc> = {},
  action: Action
): Record<string, ChatroomDoc> => {
  switch (action.type) {
    case ActionTypes.fetchChatrooms:
      return action.payload;
    case ActionTypes.clearChatrooms:
      return {};
    case ActionTypes.addNewChatroom:
      return { ...state, [action.payload.id]: action.payload };
    default:
      return state;
  }
};
