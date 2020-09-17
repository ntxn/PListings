import { Dispatch } from 'redux';

import {
  SocketIOEvents,
  UserDoc,
  ListingDoc,
  ChatroomDoc,
  MessageDoc,
  MessageStatus,
} from '../../common';
import {
  addNewChatroom,
  addSockets,
  insertMessage,
  updateMessage,
} from '../actions';
import { StoreState, ChatroomDocClient } from './interfaces';

const getChatroomDocClient = (
  chatroom: ChatroomDoc,
  socket?: SocketIOClient.Socket
): ChatroomDocClient => {
  const messages: Record<string, MessageDoc> = {};
  let lastMessage: MessageDoc | undefined = undefined;
  if (chatroom.messages && chatroom.messages.length > 0) {
    lastMessage = chatroom.messages[chatroom.messages.length - 1];
    chatroom.messages.forEach(msg => {
      messages[msg.id] = msg;
      if (msg.status === MessageStatus.Sent && socket)
        socket.emit(SocketIOEvents.MessageReceived, msg);
    });
  }

  return {
    id: chatroom.id,
    listing: chatroom.listing,
    buyer: chatroom.buyer,
    seller: chatroom.seller,
    messages,
    lastMessage,
  };
};

/**
 * Initialize a socket to connect to a namespace of the provided listing.id.
 * Set up event listeners for this socket to join a newly created room if applied.
 */
const initializeNamespaceSocket = (
  dispatch: Dispatch,
  user: UserDoc,
  listing: ListingDoc
): SocketIOClient.Socket => {
  const namespace = `/${listing.id}`;

  // Create a socket that subscribes to a namespace
  const socket = io(namespace, { query: { userId: user.id } });

  // --------------- Set event listeners for each socket ----------------
  // If the current user is the owner, join the newly created room. If the user is the buyer, insert a new chatroom to the store's chatrooms
  socket.on(SocketIOEvents.RoomCreated, (chatroom: ChatroomDoc) => {
    if (typeof chatroom.listing === 'string') chatroom.listing = listing;
    if (user.id === chatroom.seller.id)
      socket.emit(SocketIOEvents.JoinRoom, chatroom);

    const room = getChatroomDocClient(chatroom);
    if (user.id === room.seller.id || user.id === room.buyer.id)
      dispatch(addNewChatroom(room));
  });

  socket.on(SocketIOEvents.MessageSent, (message: MessageDoc) => {
    // insert message to the chatroom
    dispatch(insertMessage(message));

    if (user.id === listing.owner.id)
      socket.emit(SocketIOEvents.MessageReceived, message);
  });

  socket.on(SocketIOEvents.MessageReceived, (message: MessageDoc) => {
    // update this message with the one saved before
    dispatch(updateMessage(message));
  });

  return socket;
};

/**
 * Add an event listener to the default namespace socket for it to be notified of new namespace created,
 * so that it can join that namespace.
 * This function is called when the user first logged in and by an action creator.
 */
export const setupDefaultSocket = (
  dispatch: Dispatch,
  user: UserDoc,
  sockets: Record<string, SocketIOClient.Socket>
): void => {
  // A namespace created by a buyer
  // Check if this user is the seller, join the namespace if the seller hasn't joined it yet
  sockets.default.on(SocketIOEvents.NamespaceCreated, (listing: ListingDoc) => {
    const namespace = `/${listing.id}`;
    if (user.id === listing.owner.id && !(namespace in sockets)) {
      const socket = initializeNamespaceSocket(dispatch, user, listing);
      dispatch(addSockets({ [namespace]: socket }));
    }
  });
};

/**
 * A new chatroom belong to namespace `/listing.id` is created for this buyer and the seller.
 * This can only be initiated by a buyer through a first message from the individual listing page.
 * Seller is notified through event CreateNamespace.
 * This function is called by an action creator
 */
export const createChatroomAndSendMessageByBuyer = (
  dispatch: Dispatch,
  reduxStore: StoreState,
  msg: string
): void => {
  const { listing, user, sockets } = reduxStore;
  sockets.default.emit(SocketIOEvents.CreateNamespace, listing);

  const socket = initializeNamespaceSocket(dispatch, user!, listing!);
  socket.emit(SocketIOEvents.CreateRoom);

  socket.on(SocketIOEvents.RoomCreated, (room: ChatroomDoc) => {
    socket.emit(SocketIOEvents.Message, room.id, msg);
  });

  dispatch(addSockets({ [`/${reduxStore.listing!.id}`]: socket }));
};

/**
 * User, both seller and buyer, when first logged in, will reconnect to the chatroom they're in before they logged out.
 * The reduxStore sockets will only contain the default socket.
 * This function is called by an action creator.
 */
export const rejoinChatrooms = (
  dispatch: Dispatch,
  reduxStore: StoreState,
  user: UserDoc,
  chatroomDocs: ChatroomDoc[]
): Record<string, ChatroomDocClient> => {
  const chatrooms: Record<string, ChatroomDocClient> = {};
  const sockets: Record<string, SocketIOClient.Socket> = {};

  chatroomDocs.forEach(chatroom => {
    const { listing } = chatroom;
    const namespace = `/${listing.id}`;

    if (!(namespace in sockets)) {
      reduxStore.sockets.default.emit(SocketIOEvents.CreateNamespace, listing);
      sockets[namespace] = initializeNamespaceSocket(dispatch, user, listing);
    }

    sockets[namespace].emit(SocketIOEvents.JoinRoom, chatroom);
    chatrooms[chatroom.id] = getChatroomDocClient(chatroom, sockets[namespace]);
  });

  dispatch(addSockets(sockets));

  return chatrooms;
};
