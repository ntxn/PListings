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

  const copyRoomAndChangeMessages = (
    action: InsertMessageAction | UpdateMessageAction
  ): [string, ChatroomDocClient] => {
    const id = `${action.payload.roomId}`;

    const chatroom = { ...state[id] };
    chatroom.messages = {
      ...chatroom.messages,
      [action.payload.id]: action.payload,
    };

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
      [roomId, room] = copyRoomAndChangeMessages(action);
      delete state[roomId];

      // Set last message
      room.lastMessage = action.payload;

      return { [roomId]: room, ...state };
    case ActionTypes.updateMessage:
      [roomId, room] = copyRoomAndChangeMessages(action);
      return { ...state, [roomId]: room };
    case ActionTypes.addUnreadMsgId:
      const msg = action.payload;
      roomId = (msg.roomId as unknown) as string;
      room = { ...state[roomId] };
      if (msg.sender == room.buyer.id) room.unreadMsgIdsBySeller.push(msg.id);
      else room.unreadMsgIdsByBuyer.push(msg.id);
      return { ...state, [roomId]: room };
    case ActionTypes.clearUnreadMsgIdsByBuyer:
      room = { ...state[action.payload] };
      room.unreadMsgIdsByBuyer = [];
      return { ...state, [action.payload]: room };
    case ActionTypes.clearUnreadMsgIdsBySeller:
      room = { ...state[action.payload] };
      room.unreadMsgIdsBySeller = [];
      return { ...state, [action.payload]: room };
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
