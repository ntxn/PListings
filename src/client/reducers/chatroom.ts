import {
  ActionTypes,
  Action,
  InsertMessageAction,
  UpdateMessageAction,
  ChatroomDocClient,
} from '../utilities';

export const chatroomReducer = (
  state: Record<string, ChatroomDocClient> = {},
  action: Action
): Record<string, ChatroomDocClient> => {
  let roomId: string;
  let room: ChatroomDocClient;

  const copyRoomAndInsertMessage = (
    roomId: string,
    action: InsertMessageAction | UpdateMessageAction
  ): ChatroomDocClient => {
    const chatroom = { ...state[roomId] };
    chatroom.messages = {
      ...chatroom.messages,
      [action.payload.id]: action.payload,
    };
    return chatroom;
  };

  switch (action.type) {
    case ActionTypes.fetchChatrooms:
      return action.payload;
    case ActionTypes.clearChatrooms:
      return {};
    case ActionTypes.addNewChatroom:
      return { ...state, [action.payload.id]: action.payload };
    case ActionTypes.insertMessage:
      roomId = `${action.payload.roomId}`;
      room = copyRoomAndInsertMessage(roomId, action);

      delete state[roomId];

      // Set last message
      room.lastMessage = action.payload;

      return { ...state, [roomId]: room };
    case ActionTypes.updateMessage:
      roomId = `${action.payload.roomId}`;
      return { ...state, [roomId]: copyRoomAndInsertMessage(roomId, action) };
    default:
      return state;
  }
};
