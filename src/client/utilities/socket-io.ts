import { Dispatch } from 'redux';

import {
  SocketIOEvents,
  UserDoc,
  ListingDoc,
  ChatroomDoc,
  MessageDoc,
} from '../../common';
import { addNewChatroom, addSockets } from '../actions';

/**
 * Initialize a socket to connect to a namespace of the provided listing.id.
 * Set up event listeners for this socket to join a newly created room if applied.
 */
const initializeNamespaceSocket = (
  user: UserDoc,
  listing: ListingDoc,
  addNewChatroom: (chatroom: ChatroomDoc) => void
): SocketIOClient.Socket => {
  const namespace = `/${listing.id}`;

  // Create a socket that subscribes to a namespace
  const socket = io(namespace, { query: { user: user.id } });

  // --------------- Set event listeners for each socket ----------------
  // If the current user is the owner, join the newly created room. If the user is the buyer, insert a new chatroom to the store's chatrooms
  socket.on(SocketIOEvents.RoomCreated, (room: ChatroomDoc) => {
    if (user.id === room.seller.id) socket.emit(SocketIOEvents.JoinRoom, room);
    if (user.id === room.seller.id || user.id === room.buyer.id)
      addNewChatroom(room);
  });

  socket.on(SocketIOEvents.MessageSent, (message: MessageDoc) => {
    if (message.sender === user.id) {
      console.log(message);
      // update the message status (like add a tick)
    }
  });

  socket.on(SocketIOEvents.Message, (message: MessageDoc) =>
    console.log(message)
  );

  return socket;
};

/**
 * Add an event listener to the default namespace socket for it to be notified of new namespace created,
 * so that it can join that namespace.
 * This function is called when the user first logged in
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
      const socket = initializeNamespaceSocket(
        user,
        listing,
        (room: ChatroomDoc) => dispatch(addNewChatroom(room))
      );
      dispatch(addSockets({ namespace: socket }));
    }
  });
};

/**
 * A new chatroom belong to namespace `/listing.id` is created for this buyer and the seller.
 * This can only be initiated by a buyer through a first message from the individual listing page.
 * Seller is notified through event CreateNamespace.
 */
export const createChatroomByBuyer = (
  defaultSocket: SocketIOClient.Socket,
  listing: ListingDoc,
  user: UserDoc,
  addNewChatroom: (chatroom: ChatroomDoc) => void
): SocketIOClient.Socket => {
  defaultSocket.emit(SocketIOEvents.CreateNamespace, listing);
  const socket = initializeNamespaceSocket(user, listing, addNewChatroom);
  socket.emit(SocketIOEvents.CreateRoom);

  return socket;
};

/**
 * User, both seller and buyer, when first logged in, will reconnect to the chatroom they're in before they logged out.
 * The reduxStore sockets will only contain the default socket
 */
export const rejoinChatroom = (
  sockets: Record<string, SocketIOClient.Socket>,
  user: UserDoc,
  listing: ListingDoc,
  addNewChatroom: (chatroom: ChatroomDoc) => void,
  chatroom: ChatroomDoc
): void => {
  sockets.default.emit(SocketIOEvents.CreateNamespace, listing);

  const namespace = `/${listing.id}`;

  if (!(namespace in sockets))
    sockets[namespace] = initializeNamespaceSocket(
      user,
      listing,
      addNewChatroom
    );

  sockets[namespace].emit(SocketIOEvents.JoinRoom, chatroom);
};
