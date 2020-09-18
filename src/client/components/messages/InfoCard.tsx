import React from 'react';
import { Link } from 'react-router-dom';
import { ListingDoc, MessageDoc, UserDoc } from '../../../common';
import { Avatar } from '../UserAvatar';
import { getTimeAgoAndDateStr } from '../../utilities';

interface InfoCardProps {
  listing: ListingDoc;
  recipient: UserDoc;
  lastMsg: MessageDoc;
  onClick(): void;
  unread?: boolean;
}

export const InfoCard = (props: InfoCardProps): JSX.Element => {
  return (
    <div
      className={`messenger__info-cards__item ${
        props.unread ? 'messenger__info-cards__item--unread' : ''
      }`}
      onClick={props.onClick}
    >
      <Avatar user={props.recipient} useLink className="avatar--icon" />
      <div className="messenger__info-cards__item__middle">
        <p className="messenger__info-cards__item__recipient-name">
          {props.recipient.name}
        </p>
        <p className="messenger__info-cards__item__last-msg">
          {props.lastMsg.sender == props.recipient.id ? '' : 'You: '}
          {props.lastMsg.content}
        </p>
        <p className="messenger__info-cards__item__last-sent-at">
          {getTimeAgoAndDateStr(props.lastMsg.createdAt)}
        </p>
      </div>
      <Link
        className="messenger__info-cards__item__listing-photo"
        to={`/listings/${props.listing.id}`}
      >
        <img src={`/img/listings/${props.listing.photos[0]}`} />
      </Link>
    </div>
  );
};
