import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';

import { history } from '../../history';
import { UserDoc, ListingDoc } from '../../../common';
import { StoreState, ChatroomDocClient } from '../../utilities';
import { InfoCard } from './InfoCard';
import { ConversationCard } from './ConversationCard';
import { replaceListing } from '../../actions';

interface MessengerProps {
  user: UserDoc;
  chatrooms: Record<string, ChatroomDocClient>;

  replaceListing(listing: ListingDoc): void;

  match: { params: { id?: string } };
}

const _Messenger = (props: MessengerProps): JSX.Element => {
  const [chatroom, setChatroom] = useState<ChatroomDocClient>();

  useEffect(() => {
    const { id } = props.match.params;
    const roomIds = Object.keys(props.chatrooms);

    if (roomIds.length > 0) {
      if (id && roomIds.includes(id)) setChatroom(props.chatrooms[id]);
      else {
        let index = -1;
        let room: ChatroomDocClient;
        let unreadMsgIds: string[] = [];

        do {
          index++;
          room = props.chatrooms[roomIds[index]];
          unreadMsgIds =
            props.user.id == room.buyer.id
              ? room.unreadMsgIdsByBuyer
              : room.unreadMsgIdsBySeller;
        } while (room && unreadMsgIds.length > 0);

        if (index < roomIds.length) {
          setChatroom(props.chatrooms[roomIds[index]]);
          history.push(`/messages/${roomIds[index]}`);
        } else setChatroom(undefined);
      }
    } else {
      setChatroom(undefined);
      if (id) history.push('/messages');
    }
  }, [props.chatrooms]);

  const renderInfoCards = (): JSX.Element => {
    const rooms = Object.values(props.chatrooms).filter(
      room => room.lastMessage
    );
    return (
      <div className="messenger__info-cards">
        {rooms.length === 0 && (
          <div className="messenger__info-cards__no-msg">No messages found</div>
        )}
        {rooms.map(room => {
          const { id, buyer, seller, listing, lastMessage } = room;
          let recipient = seller;
          let unreadMsgIds = room.unreadMsgIdsByBuyer;

          if (props.user.id === seller.id) {
            recipient = buyer;
            unreadMsgIds = room.unreadMsgIdsBySeller;
          }

          return (
            <InfoCard
              key={id}
              listing={listing}
              lastMsg={lastMessage!}
              recipient={recipient}
              onClick={() => {
                setChatroom(room);
                history.push(`/messages/${id}`);
              }}
              unread={unreadMsgIds.length > 0}
              active={chatroom ? id == chatroom.id : false}
              replaceListing={() => props.replaceListing(listing)}
            />
          );
        })}
      </div>
    );
  };

  return (
    <div className="messenger">
      {renderInfoCards()}
      {chatroom && <ConversationCard chatroom={chatroom} />}
    </div>
  );
};

const mapStateToProps = (state: StoreState) => {
  return { chatrooms: state.chatrooms };
};

export const Messenger = connect(mapStateToProps, { replaceListing })(
  _Messenger
);
