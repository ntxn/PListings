import axios from 'axios';
import { Dispatch } from 'redux';

import {
  FetchChatroomsAction,
  ClearChatroomsAction,
  AddNewChatroomAction,
  ActionTypes,
  rejoinChatroom,
  StoreState,
} from '../utilities';
import { addSockets } from './socket-io';
import { ApiRoutes, ChatroomDoc, UserDoc } from '../../common';

export const addNewChatroom = (chatroom: ChatroomDoc): AddNewChatroomAction => {
  return {
    type: ActionTypes.addNewChatroom,
    payload: chatroom,
  };
};

export const clearChatrooms = (): ClearChatroomsAction => {
  return { type: ActionTypes.clearChatrooms };
};

/**
 * When the user first logged in, all chatrooms that they participated in will be fetched,
 * a new socket for each namespace that a chatroom belonged to will be recreated
 */
export const fetchChatrooms = async (
  dispatch: Dispatch,
  reduxStore: StoreState,
  user: UserDoc
): Promise<void> => {
  const response = await axios.get(ApiRoutes.ChatroomsByUser);
  const chatroomDocs = response.data.data as ChatroomDoc[];

  const chatrooms: Record<string, ChatroomDoc> = {};
  const sockets: Record<string, SocketIOClient.Socket> = {};
  if (chatroomDocs.length > 0) {
    chatroomDocs.forEach(chatroom => {
      chatrooms[chatroom.id] = chatroom;

      rejoinChatroom(
        reduxStore.sockets.default,
        sockets,
        user,
        chatroom.listing,
        (chatroom: ChatroomDoc) => dispatch(addNewChatroom(chatroom)),
        chatroom
      );
    });

    dispatch(addSockets(sockets));
  }

  dispatch<FetchChatroomsAction>({
    type: ActionTypes.fetchChatrooms,
    payload: chatrooms,
  });
};
