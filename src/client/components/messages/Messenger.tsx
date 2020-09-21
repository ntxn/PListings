import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';

import { history } from '../../history';
import { UserDoc } from '../../../common';
import { StoreState, ChatroomDocClient } from '../../utilities';
import { InfoCard } from './InfoCard';
import { ConversationCard } from './ConversationCard';
import { Unauthorized } from '../Unauthorized';

interface MessengerProps {
  user: UserDoc | null;
  chatrooms: Record<string, ChatroomDocClient>;

  match: { params: { id?: string } };
}

const _Messenger = (props: MessengerProps): JSX.Element => {
  const [chatroom, setChatroom] = useState<ChatroomDocClient>();

  useEffect(() => {
    if (props.user) {
      const roomIds = Object.keys(props.chatrooms);

      if (roomIds.length > 0) {
        if (props.match.params.id && props.chatrooms[props.match.params.id])
          setChatroom(props.chatrooms[props.match.params.id]);
        else {
          setChatroom(props.chatrooms[roomIds[0]]);
          history.push(`/messages/${roomIds[0]}`);
        }
      } else {
        // no chat messages, display 'No conversation'
        console.log('No conversations found');
        setChatroom(undefined);
        history.push('/messages');
      }
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
                onClick={() => {
                  setChatroom(room);
                  history.push(`/messages/${id}`);
                }}
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
