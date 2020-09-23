import axios from 'axios';
import { Dispatch } from 'redux';

import {
  FetchChatroomsAction,
  ClearChatroomsAction,
  AddNewChatroomAction,
  DeleteChatroomAction,
  InsertMessageAction,
  UpdateMessageAction,
  ClearUnreadMsgIdsByBuyerAction,
  ClearUnreadMsgIdsBySellerAction,
  AddUnreadMsgIdAction,
  TypingAction,
  StopTypingAction,
  ActionTypes,
  rejoinChatrooms,
  StoreState,
  ChatroomDocClient,
  createChatroomAndSendMessageByBuyer,
} from '../utilities';
import { AlertType, showAlert } from '../components/alert';
import { ApiRoutes, ChatroomDoc, MessageDoc, UserDoc } from '../../common';

/**
 * An action creator to add a new chatroom to redux store chatrooms
 * @param chatroom (ChatroomDoc)
 */
export const addNewChatroom = (
  chatroom: ChatroomDocClient
): AddNewChatroomAction => {
  return {
    type: ActionTypes.addNewChatroom,
    payload: chatroom,
  };
};

/**
 * Delete chatroom with the provided Id from db and remove it from redux store
 */
export const deleteChatroom = (id: string) => async (
  dispatch: Dispatch
): Promise<void> => {
  try {
    await axios.delete(`${ApiRoutes.Chatrooms}/${id}`);

    dispatch<DeleteChatroomAction>({
      type: ActionTypes.deleteChatroom,
      payload: id,
    });

    showAlert(AlertType.Success, 'Deleted conversation successfully');
  } catch (err) {
    console.log(err);
    showAlert(AlertType.Error, 'Issue with deleting this conversation');
  }
};

/**
 * Action creator to reset chatrooms from redux store
 */
export const clearChatrooms = (): ClearChatroomsAction => {
  return { type: ActionTypes.clearChatrooms };
};

/**
 * An action creator used for buyer to initiate a conversation with seller through a mini chatbox in the listing page
 * @param msg (string) input value from the chatbox
 */
export const initiateConversation = (msg: string) => (
  dispatch: Dispatch,
  getState: () => StoreState
): void => createChatroomAndSendMessageByBuyer(dispatch, getState(), msg);

/**
 * When the user first logged in, all chatrooms that they participated in will be fetched,
 * a new socket for each namespace that a chatroom belonged to will be recreated.
 * This function is called by an action creator
 */
export const fetchChatrooms = async (
  dispatch: Dispatch,
  reduxStore: StoreState,
  user: UserDoc
): Promise<void> => {
  const response = await axios.get(ApiRoutes.ChatroomsByUser);
  const chatroomDocs = response.data.data as ChatroomDoc[];

  const chatrooms = rejoinChatrooms(dispatch, reduxStore, user, chatroomDocs);

  dispatch<FetchChatroomsAction>({
    type: ActionTypes.fetchChatrooms,
    payload: chatrooms,
  });
};

export const insertMessage = (message: MessageDoc): InsertMessageAction => {
  return {
    type: ActionTypes.insertMessage,
    payload: message,
  };
};

export const updateMessage = (message: MessageDoc): UpdateMessageAction => {
  return {
    type: ActionTypes.updateMessage,
    payload: message,
  };
};

export const clearUnreadMsgIdsByBuyer = (roomId: string) => (
  dispatch: Dispatch
): void => {
  dispatch<ClearUnreadMsgIdsByBuyerAction>({
    type: ActionTypes.clearUnreadMsgIdsByBuyer,
    payload: roomId,
  });
};

export const clearUnreadMsgIdsBySeller = (roomId: string) => (
  dispatch: Dispatch
): void => {
  dispatch<ClearUnreadMsgIdsBySellerAction>({
    type: ActionTypes.clearUnreadMsgIdsBySeller,
    payload: roomId,
  });
};

export const addUnreadMsgId = (message: MessageDoc): AddUnreadMsgIdAction => {
  return {
    type: ActionTypes.addUnreadMsgId,
    payload: message,
  };
};

export const typing = (roomId: string): TypingAction => {
  return {
    type: ActionTypes.typing,
    payload: roomId,
  };
};

export const stopTyping = (roomId: string): StopTypingAction => {
  return {
    type: ActionTypes.stopTyping,
    payload: roomId,
  };
};
