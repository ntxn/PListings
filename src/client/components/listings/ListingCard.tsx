import React from 'react';

import { ListingDoc } from '../../../server/models';
import { Link } from 'react-router-dom';

interface ListingCardProps {
  listing: ListingDoc;
  distanceDiff: number;
}

export const ListingCard = (props: ListingCardProps): JSX.Element => {
  const listingPage = `/listings/${props.listing.id}`;

  return (
    <div className="listing-card">
      <Link to={listingPage}>
        <div className="listing-card__photos u-margin-bottom-xsmall">
          <img src={`/img/listings/${props.listing.photos[0]}`} />
        </div>
      </Link>

      <div className="listing-card__info">
        <p className="listing-card__info__city">{`${
          props.listing.location.city
        } · ${props.distanceDiff.toFixed(1)} mi`}</p>
        <Link
          to={listingPage}
          className="listing-card__info__title heading-tertiary"
        >
          {props.listing.title}
        </Link>
        <p className="listing-card__info__price heading-quaternary">
          ${props.listing.price}
        </p>
      </div>
      <div className="listing-card__save-btn"></div>
    </div>
  );
};
