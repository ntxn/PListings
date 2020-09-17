import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';

import { UserDoc } from '../../../common';
import { StoreState, ChatroomDocClient } from '../../utilities';
import { InfoCard } from './InfoCard';
import { Unauthorized } from '../Unauthorized';

interface MessengerProps {
  user: UserDoc | null;
  chatrooms: Record<string, ChatroomDocClient>;
}

const _Messenger = (props: MessengerProps): JSX.Element => {
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
                onClick={() => console.log(id)}
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
        <div className="messenger__conversation-card">hi</div>
      </div>
    );
  };

  return <>{props.user ? renderContent() : <Unauthorized />}</>;
};

const mapStateToProps = (state: StoreState) => {
  return { user: state.user, chatrooms: state.chatrooms };
};

export const Messenger = connect(mapStateToProps)(_Messenger);
