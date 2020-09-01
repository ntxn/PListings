import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import { ListingDoc } from '../../../server/models';
import { ImageSlider } from '../ImageSlider';

interface ListingCardProps {
  listing: ListingDoc;
  distanceDiff: number;
}

export const ListingCard = (props: ListingCardProps): JSX.Element => {
  const listingPage = `/listings/${props.listing.id}`;
  const [showImageSlider, setShowImageSlider] = useState(false);

  useEffect(() => {
    const imageSliderTimeout = setTimeout(() => setShowImageSlider(true), 500);
    return () => clearTimeout(imageSliderTimeout);
  }, []);

  return (
    <div className="listing-card">
      <div className="listing-card__photos u-margin-bottom-xsmall">
        {showImageSlider && (
          <ImageSlider
            images={props.listing.photos}
            containerClassName="listing-card__photos"
            pagination
            linkTo={listingPage}
            backgroundSize="cover"
          />
        )}
      </div>

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
