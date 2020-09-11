import { app } from './app';
import socketIO from 'socket.io';
import mongoose from 'mongoose';

import { ListingDoc } from './models';
import { SocketIOEvents } from '../common';

const listingIds: Set<mongoose.Types.ObjectId> = new Set();
const namespaces: Record<string, socketIO.Namespace> = {};

const io = socketIO(app);

io.on('connection', socket => {
  socket.on(SocketIOEvents.CreateNamespace, (listing: ListingDoc) => {
    if (!listingIds.has(listing.id)) {
      listingIds.add(listing.id);

      const namespaceName = `/${listing.id}`;
      const namespace = io.of(namespaceName);

      namespace.on('connection', socket => {
        const { user } = socket.handshake.query;
        const roomName = `${user}`;

        if (listing.owner.id !== user)
          socket.join(roomName, () => {
            namespace.emit(SocketIOEvents.CreateRoom, roomName);
          });

        if (listing.owner.id === user)
          socket.on(SocketIOEvents.CreateRoom, (roomName: string) => {
            socket.join(roomName, () =>
              console.log(`owner joined ${roomName}`)
            );
          });

        socket.on(SocketIOEvents.SendMessage, (data: string) => {
          console.log(data);

          namespace.to(roomName).emit(SocketIOEvents.SendMessage, data);
        });
      });

      namespaces[namespaceName] = namespace;
    }
  });
});
