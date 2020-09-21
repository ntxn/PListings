import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';

import { UserDoc } from '../../../common';
import { StoreState, ChatroomDocClient } from '../../utilities';
import { InfoCard } from './InfoCard';
import { ConversationCard } from './ConversationCard';
import { Unauthorized } from '../Unauthorized';

interface MessengerProps {
  user: UserDoc | null;
  chatrooms: Record<string, ChatroomDocClient>;
}

const _Messenger = (props: MessengerProps): JSX.Element => {
  const [chatroom, setChatroom] = useState<ChatroomDocClient>();

  useEffect(() => {
    if (props.user) {
      const rooms = Object.values(props.chatrooms);
      if (rooms.length > 0) setChatroom(rooms[0]);
    }
  }, [props.user, props.chatrooms]);

  const renderInfoCards = (): JSX.Element => {
    return (
      <div className="messenger__info-cards">
        {Object.values(props.chatrooms)
          .filter(room => room.lastMessage)
          .map(room => {
            const { id, buyer, seller, listing, lastMessage } = room;
            return (
              <InfoCard
                key={id}
                listing={listing}
                lastMsg={lastMessage!}
                recipient={props.user!.id == buyer.id ? seller : buyer}
                onClick={() => setChatroom(props.chatrooms[id])}
                active={chatroom ? id == chatroom.id : false}
              />
            );
          })}
      </div>
    );
  };

  const renderContent = (): JSX.Element => {
    return (
      <div className="messenger">
        {renderInfoCards()}
        {chatroom && <ConversationCard chatroom={chatroom} />}
      </div>
    );
  };

  return <>{props.user ? renderContent() : <Unauthorized />}</>;
};

const mapStateToProps = (state: StoreState) => {
  return { user: state.user, chatrooms: state.chatrooms };
};

export const Messenger = connect(mapStateToProps)(_Messenger);
