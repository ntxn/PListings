import React, { FormEvent, useState } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import { SocketIOEvents, UserDoc } from '../../../common';
import { Avatar } from '../UserAvatar';
import { StoreState, ChatroomDocClient, getLocationStr } from '../../utilities';

interface ConversationCardProps {
  // from parent component
  chatroom: ChatroomDocClient;

  // from reduxStore
  user: UserDoc | null;
  sockets: Record<string, SocketIOClient.Socket>;
}

const _ConversationCard = (props: ConversationCardProps): JSX.Element => {
  const { listing, messages, buyer, seller, id } = props.chatroom;
  const recipient = props.user!.id == buyer.id ? seller : buyer;

  const [inputContent, setInputContent] = useState('');

  const onSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();

    const namespace = `/${listing.id}`;
    props.sockets[namespace].emit(SocketIOEvents.Message, id, inputContent);

    setInputContent('');
  };

  const renderHeader = (): JSX.Element => {
    return (
      <Link
        to={`/listings/${listing.id}`}
        className="messenger__conversation-card__listing"
      >
        <div className="messenger__conversation-card__listing__photo">
          <img src={`/img/listings/${listing.photos[0]}`} />
        </div>
        <div className="messenger__conversation-card__listing__details">
          <p className="u-margin-bottom-xxsmall heading-quaternary">
            {listing.title}
          </p>
          <p className="sub-heading-quaternary">
            ${listing.price} · {getLocationStr(listing.location)}
          </p>
        </div>
      </Link>
    );
  };

  const renderBody = (): JSX.Element => {
    return (
      <div className="messenger__conversation-card__body">
        <Link
          to={`/user/profile/${recipient.id}`}
          className="messenger__conversation-card__recipient"
        >
          <Avatar user={recipient} className="avatar--user-menu" />
          <div className="messenger__conversation-card__recipient__info">
            <p className="heading-quaternary">{recipient.name}</p>
            <p className="sub-heading-quaternary">
              {getLocationStr(recipient.location)}
            </p>
          </div>
        </Link>
        <ul className="messenger__conversation-card__messages">
          {Object.values(messages).map(msg => {
            const className = `messenger__conversation-card__message--${
              recipient.id == msg.sender ? 'left' : 'right'
            }`;
            return (
              <li className={className} key={msg.id}>
                <div className={`${className}__content`}>
                  {msg.content} - {msg.status}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    );
  };

  const renderFooter = (): JSX.Element => {
    return (
      <form className="messenger__conversation-card__form" onSubmit={onSubmit}>
        <input
          type="text"
          className="messenger__conversation-card__input"
          value={inputContent}
          onChange={e => setInputContent(e.target.value)}
        />
        <button
          className="messenger__conversation-card__submit-btn"
          type="submit"
          disabled={inputContent === ''}
        >
          Send
        </button>
      </form>
    );
  };

  return (
    <div className="messenger__conversation-card">
      {renderHeader()}
      {renderBody()}
      {renderFooter()}
    </div>
  );
};

const mapStateToProps = (state: StoreState) => {
  return { user: state.user, sockets: state.sockets };
};

export const ConversationCard = connect(mapStateToProps)(_ConversationCard);
