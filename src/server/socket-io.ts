import { app } from './app';
import socketIO from 'socket.io';
import mongoose from 'mongoose';

import {
  ListingDoc,
  Message,
  Chatroom,
  ChatroomDoc,
  MessageDoc,
} from './models';
import { MessageStatus, SocketIOEvents } from '../common';

const namespaces: Record<string, socketIO.Namespace> = {};
const chatrooms: Record<string, ChatroomDoc> = {};

const io = socketIO(app);

io.on('connection', socket => {
  socket.on(SocketIOEvents.CreateNamespace, (listing: ListingDoc) => {
    // Notify all sockets in default namespace that there's a new namespace created
    io.emit(SocketIOEvents.NamespaceCreated, listing);

    const namespaceName = `/${listing.id}`;

    if (!(namespaceName in namespaces)) {
      const namespace = io.of(namespaceName);

      // Initialize the current namespace
      namespace.on('connection', socket => {
        const { userId } = socket.handshake.query;

        // A chatroom already existed, rejoin
        socket.on(SocketIOEvents.JoinRoom, (chatroom: ChatroomDoc) => {
          socket.join(chatroom.id);
          if (!(chatroom.id in chatrooms)) chatrooms[chatroom.id] = chatroom;
        });

        // Buyer creates a new chatroom & invites owner to join
        socket.on(SocketIOEvents.CreateRoom, async () => {
          const chatroom = Chatroom.build({
            listing: listing.id,
            seller: listing.owner.id,
            buyer: userId,
          });
          await chatroom.save();

          chatrooms[chatroom.id] = chatroom;
          socket.join(chatroom.id);
          namespace.emit(SocketIOEvents.RoomCreated, chatroom);
        });

        socket.on(
          SocketIOEvents.Message,
          async (chatroomId: mongoose.Types.ObjectId, msg: string) => {
            const message = Message.build({
              roomId: chatroomId,
              content: msg,
              sender: userId,
            });
            await message.save();

            namespace
              .to(`${chatroomId}`)
              .emit(SocketIOEvents.MessageSent, message);
          }
        );

        socket.on(SocketIOEvents.MessageReceived, async (msg: MessageDoc) => {
          const message = await Message.findByIdAndUpdate(
            msg.id,
            { status: MessageStatus.Delivered },
            { new: true }
          );

          namespace
            .to(`${msg.roomId}`)
            .emit(SocketIOEvents.MessageReceived, message);
        });

        socket.on(SocketIOEvents.MessageSeen, async (msg: MessageDoc) => {
          const message = await Message.findByIdAndUpdate(
            msg.id,
            { status: MessageStatus.Seen },
            { new: true }
          );

          namespace
            .to(`${msg.roomId}`)
            .emit(SocketIOEvents.MessageSeen, message);
        });

        socket.on(SocketIOEvents.Typing, (roomId: string) => {
          namespace.to(roomId).emit(SocketIOEvents.Typing, { userId, roomId });
        });

        socket.on(SocketIOEvents.StopTyping, (roomId: string) => {
          namespace
            .to(roomId)
            .emit(SocketIOEvents.StopTyping, { userId, roomId });
        });

        socket.on(SocketIOEvents.ListingSold, () => {
          socket.broadcast.emit(SocketIOEvents.ListingSold);
        });
      });

      namespaces[namespaceName] = namespace;
    }
  });
});
