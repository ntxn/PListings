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
    action: InsertMessageAction | UpdateMessageAction
  ): [string, ChatroomDocClient] => {
    const id = `${action.payload.roomId}`;

    const chatroom = { ...state[id] };
    chatroom.messages = {
      ...chatroom.messages,
      [action.payload.id]: action.payload,
    };

    delete state[id];

    return [id, chatroom];
  };

  switch (action.type) {
    case ActionTypes.fetchChatrooms:
      return action.payload;
    case ActionTypes.clearChatrooms:
      return {};
    case ActionTypes.addNewChatroom:
      return { ...state, [action.payload.id]: action.payload };
    case ActionTypes.deleteChatroom:
      const rooms = { ...state };
      delete rooms[action.payload];
      return rooms;
    case ActionTypes.insertMessage:
      [roomId, room] = copyRoomAndInsertMessage(action);

      // Set last message
      room.lastMessage = action.payload;

      return { [roomId]: room, ...state };
    case ActionTypes.updateMessage:
      [roomId, room] = copyRoomAndInsertMessage(action);
      return { [roomId]: room, ...state };
    case ActionTypes.typing:
      room = { ...state[action.payload] };
      room.typing = true;
      return { ...state, [action.payload]: room };
    case ActionTypes.stopTyping:
      room = { ...state[action.payload] };
      room.typing = false;
      return { ...state, [action.payload]: room };
    default:
      return state;
  }
};
