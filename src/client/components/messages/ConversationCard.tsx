import React, { FormEvent, useState } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { MdDelete } from 'react-icons/md';
import { BsCheck, BsCheckAll } from 'react-icons/bs';
import SyncLoader from 'react-spinners/SyncLoader';

import { deleteChatroom } from '../../actions';
import {
  MessageDoc,
  MessageStatus,
  SocketIOEvents,
  UserDoc,
} from '../../../common';
import { Avatar } from '../UserAvatar';
import {
  StoreState,
  ChatroomDocClient,
  getLocationStr,
  getDateTimeStr,
} from '../../utilities';

interface ConversationCardProps {
  // from parent component
  chatroom: ChatroomDocClient;

  // from reduxStore
  user: UserDoc | null;
  sockets: Record<string, SocketIOClient.Socket>;

  // from dispatch
  deleteChatroom(id: string): void;
}

const _ConversationCard = (props: ConversationCardProps): JSX.Element => {
  const { listing, messages, buyer, seller, id, typing } = props.chatroom;
  const recipient = props.user!.id == buyer.id ? seller : buyer;
  const namespace = `/${listing.id}`;

  const [inputContent, setInputContent] = useState('');

  const onSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();

    props.sockets[namespace].emit(SocketIOEvents.Message, id, inputContent);

    setInputContent('');
  };

  const renderHeader = (): JSX.Element => {
    return (
      <div className="messenger__conversation-card__header">
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
        <div
          className="messenger__conversation-card__delete icon"
          onClick={() => props.deleteChatroom(id)}
        >
          <MdDelete title="Delete conversation" />
        </div>
      </div>
    );
  };

  const formatDate = (date: Date, rightAlign = false): JSX.Element => {
    const dateArr = getDateTimeStr(date).split(',');
    return (
      <p
        className={`messenger__conversation-card__message__sent-at ${
          rightAlign
            ? 'messenger__conversation-card__message__sent-at--right-align'
            : ''
        }`}
      >
        {dateArr[0]}
        {dateArr.length === 2 && (
          <>
            <br /> {dateArr[1]}
          </>
        )}
      </p>
    );
  };

  const renderRecipientMessage = (
    msg: MessageDoc,
    showAvatar: boolean
  ): JSX.Element => {
    return (
      <li className="messenger__conversation-card__message--left" key={msg.id}>
        <Avatar
          useLink
          user={recipient}
          className={`avatar--chat ${showAvatar ? '' : 'u-invisible'}`}
        />
        <div className="messenger__conversation-card__message--left__content">
          {msg.content}
        </div>
        {formatDate(msg.createdAt)}
      </li>
    );
  };

  const renderSenderMessage = (msg: MessageDoc): JSX.Element => {
    const getStatus = (): JSX.Element => {
      switch (msg.status) {
        case MessageStatus.Sent:
          return <BsCheck />;
        case MessageStatus.Delivered:
          return <BsCheckAll />;
        case MessageStatus.Seen:
          return (
            <BsCheckAll className="messenger__conversation-card__message--right__status--seen" />
          );
      }
    };

    return (
      <li className="messenger__conversation-card__message--right" key={msg.id}>
        {formatDate(msg.createdAt, true)}
        <div className="messenger__conversation-card__message--right__content">
          {msg.content}
        </div>
        <div className="messenger__conversation-card__message--right__status">
          {getStatus()}
        </div>
      </li>
    );
  };

  const renderMessages = (): JSX.Element => {
    const msgs = Object.values(messages);
    return (
      <ul>
        {msgs.map((msg, i) => {
          const lastMsg = i === msgs.length - 1;
          if (recipient.id == msg.sender)
            return renderRecipientMessage(
              msg,
              lastMsg || recipient.id != msgs[i + 1].sender
            );

          return renderSenderMessage(msg);
        })}
      </ul>
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
        {renderMessages()}
        {typing && (
          <div className="messenger__conversation-card__message--left">
            <Avatar useLink user={recipient} className="avatar--chat" />
            <div className="messenger__conversation-card__message--left__content">
              <SyncLoader color={'rgb(82, 82, 82)'} size={6} />
            </div>
          </div>
        )}
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
          placeholder="Type a message..."
          onChange={e => setInputContent(e.target.value)}
          onKeyPress={() => {
            props.sockets[namespace].emit(SocketIOEvents.Typing, id);
          }}
          onKeyUp={() => {
            props.sockets[namespace].emit(SocketIOEvents.StopTyping, id);
          }}
        />
        <button
          className="messenger__conversation-card__submit-btn btn btn--filled"
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

export const ConversationCard = connect(mapStateToProps, { deleteChatroom })(
  _ConversationCard
);
