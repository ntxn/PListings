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
  active: boolean;
  unread?: boolean;
  replaceListing(): void;
}

export const InfoCard = (props: InfoCardProps): JSX.Element => {
  const clickable = props.listing.active && !props.listing.sold;

  return (
    <div
      className={`messenger__info-cards__item ${
        props.unread ? 'messenger__info-cards__item--unread' : ''
      } ${props.active ? 'messenger__info-cards__item--active' : ''}`}
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
        className={`messenger__info-cards__item__listing-photo ${
          !clickable
            ? 'messenger__info-cards__item__listing-photo--disabled'
            : ''
        }`}
        to={`/listings/${props.listing.id}`}
        onClick={event => {
          if (clickable) {
            event.stopPropagation();
            props.replaceListing();
          }
        }}
      >
        <img src={`/img/listings/${props.listing.photos[0]}`} />
      </Link>
    </div>
  );
};
