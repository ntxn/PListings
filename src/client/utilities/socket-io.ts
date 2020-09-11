import { ListingDoc, SocketIOEvents, UserDoc } from '../../common';

export const initializeSocket = (
  defaultSocket: SocketIOClient.Socket,
  listing: ListingDoc,
  sockets: Record<string, SocketIOClient.Socket>,
  user: UserDoc
): void => {
  // create a namespace per listing
  defaultSocket.emit(SocketIOEvents.CreateNamespace, listing);

  // create a socket per namespace
  const id = `/${listing.id}`;
  sockets[id] = io(id, {
    query: { user: user.id },
  });

  sockets[id].on(SocketIOEvents.CreateRoom, (roomName: string) => {
    sockets[id].emit(SocketIOEvents.CreateRoom, roomName);
  });

  sockets[id].on(SocketIOEvents.SendMessage, (data: string) =>
    console.log(data)
  );
};
