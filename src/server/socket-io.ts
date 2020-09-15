import { app } from './app';
import socketIO from 'socket.io';
import mongoose from 'mongoose';

import { ListingDoc, Message, Chatroom, ChatroomDoc } from './models';
import { SocketIOEvents } from '../common';

const namespaces: Record<string, socketIO.Namespace> = {};
const chatrooms: Record<string, ChatroomDoc> = {};

const io = socketIO(app);

io.on('connection', socket => {
  socket.on(SocketIOEvents.CreateNamespace, (listing: ListingDoc) => {
    const namespaceName = `/${listing.id}`;

    if (!(namespaceName in namespaces)) {
      const namespace = io.of(namespaceName);

      // Notify all sockets in default namespace that there's a new namespace created
      io.emit(SocketIOEvents.NamespaceCreated, listing);

      // Initialize the current namespace
      namespace.on('connection', socket => {
        const { user } = socket.handshake.query;

        // A chatroom already existed, rejoin
        socket.on(SocketIOEvents.JoinRoom, (chatroom: ChatroomDoc) => {
          if (!(chatroom.id in chatrooms)) chatrooms[chatroom.id] = chatroom;
        });

        // Buyer creates a new chatroom & invites owner to join
        socket.on(SocketIOEvents.CreateRoom, async () => {
          const chatroom = Chatroom.build({
            listing: listing.id,
            seller: listing.owner.id,
            buyer: user,
          });
          await chatroom.save();

          chatrooms[chatroom.id] = chatroom;
          namespace.emit(SocketIOEvents.RoomCreated, chatroom);
        });

        socket.on(
          SocketIOEvents.Message,
          async (chatroomId: mongoose.Types.ObjectId, msg: string) => {
            const message = Message.build({
              roomId: chatroomId,
              content: msg,
              sender: user.id,
            });
            await message.save();

            const roomName = chatroomId.toHexString();
            console.log('chatroomid', roomName, chatroomId);
            namespace.to(roomName).emit(SocketIOEvents.MessageSent, message);

            // if receiver is online, send message, if not, save message to another collection to be retrieved later when the user logged in
            console.log(
              namespace.to(roomName).clients,
              namespace.to(roomName).sockets
            );
          }
        );
      });

      namespaces[namespaceName] = namespace;
    }
  });
});
