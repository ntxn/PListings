import { Dispatch } from 'redux';

import {
  SocketIOEvents,
  UserDoc,
  ListingDoc,
  ChatroomDoc,
  MessageDoc,
} from '../../common';
import { addNewChatroom, addSockets } from '../actions';
import { StoreState } from './interfaces';

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
  socket.on(SocketIOEvents.RoomCreated, (room: ChatroomDoc) => {
    if (typeof room.listing === 'string') room.listing = listing;

    if (user.id === room.seller.id) socket.emit(SocketIOEvents.JoinRoom, room);
    if (user.id === room.seller.id || user.id === room.buyer.id)
      dispatch(addNewChatroom(room));
  });

  socket.on(SocketIOEvents.MessageSent, (message: MessageDoc) => {
    console.log(user.id, listing, message);
    if (message.sender === user.id) {
      console.log(message);
      // update the message status (like add a tick)
    } else if (user.id === listing.owner.id) console.log(message);
  });

  socket.on(SocketIOEvents.Message, (message: MessageDoc) =>
    console.log(message)
  );

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
      dispatch(addSockets({ namespace: socket }));
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
): Record<string, ChatroomDoc> => {
  const chatrooms: Record<string, ChatroomDoc> = {};
  const sockets: Record<string, SocketIOClient.Socket> = {};

  chatroomDocs.forEach(chatroom => {
    chatrooms[chatroom.id] = chatroom;

    const { listing } = chatroom;
    const namespace = `/${listing.id}`;

    if (!(namespace in sockets)) {
      reduxStore.sockets.default.emit(SocketIOEvents.CreateNamespace, listing);
      sockets[namespace] = initializeNamespaceSocket(dispatch, user, listing);
    }

    sockets[namespace].emit(SocketIOEvents.JoinRoom, chatroom);
  });

  dispatch(addSockets(sockets));

  return chatrooms;
};
