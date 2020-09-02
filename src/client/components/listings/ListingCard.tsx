import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { FaHeart } from 'react-icons/fa';

import { ListingDoc, UserDoc } from '../../../server/models';
import { ImageSlider } from '../ImageSlider';
import { promptUserToLogInToSaveListing } from '../Modal';
import { StoreState } from '../../utilities';
import { unsaveListing, saveListing } from '../../actions';

interface ListingCardProps {
  // from Parent component
  listing: ListingDoc;
  distanceDiff: number;

  // from StoreState
  user: UserDoc | null;
  savedListings: Record<string, string>;

  // From dispatch
  saveListing(listingId: string): void;
  unsaveListing(listingId: string): void;
}

const _ListingCard = (props: ListingCardProps): JSX.Element => {
  const listingPage = `/listings/${props.listing.id}`;
  const [showImageSlider, setShowImageSlider] = useState(false);
  const [showLogInModal, setShowLogInModal] = useState(false);

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
            bordered
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
      {(!props.user || props.user.id !== props.listing.owner.id) && (
        <div
          className={`listing-card__save-btn ${
            props.savedListings[props.listing.id]
              ? 'listing-card__save-btn--saved'
              : ''
          }`}
          onClick={() => {
            if (props.user) {
              if (props.savedListings[props.listing.id])
                props.unsaveListing(props.listing.id);
              else props.saveListing(props.listing.id);
            } else setShowLogInModal(true);
          }}
        >
          <FaHeart
            title={`${
              props.savedListings[props.listing.id] ? 'Unsave' : 'Save'
            } listing`}
          />
        </div>
      )}
      {promptUserToLogInToSaveListing(showLogInModal, () =>
        setShowLogInModal(false)
      )}
    </div>
  );
};

const mapStateToProps = (state: StoreState) => {
  return { user: state.user, savedListings: state.savedListings };
};

export const ListingCard = connect(mapStateToProps, {
  saveListing,
  unsaveListing,
})(_ListingCard);
