import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { FaHeart } from 'react-icons/fa';
import { FiEdit } from 'react-icons/fi';
import { FaEdit } from 'react-icons/fa';
import { MdDelete } from 'react-icons/md';

import { ListingDoc, UserDoc } from '../../common';
import { ImageSlider } from './ImageSlider';
import { promptUserToLogInToSaveListing } from './Modal';
import { StoreState } from '../utilities';
import { unsaveListing, saveListing } from '../actions';

interface ListingCardProps {
  // from Parent component
  listing: ListingDoc;
  renderInfoContent(): JSX.Element;
  showSavedBtn?: boolean;
  saved?: boolean;
  showEditBtn?: boolean;
  showDeleteBtn?: boolean;

  // from StoreState
  user: UserDoc | null;

  // From dispatch
  saveListing(listingId: string): void;
  unsaveListing(listingId: string): void;
}

const _ListingCard = (props: ListingCardProps): JSX.Element => {
  const [showImageSlider, setShowImageSlider] = useState(false);
  const [showLogInModal, setShowLogInModal] = useState(false);

  useEffect(() => {
    const imageSliderTimeout = setTimeout(() => setShowImageSlider(true), 500);
    return () => clearTimeout(imageSliderTimeout);
  }, []);

  const renderSaveBtn = (): JSX.Element => {
    return (
      <>
        {(!props.user || props.user.id !== props.listing.owner.id) && (
          <div
            className={`listing-card__icon-btn ${
              props.saved ? 'listing-card__icon-btn--saved' : ''
            }`}
            onClick={() => {
              if (props.user) {
                if (props.saved) props.unsaveListing(props.listing.id);
                else props.saveListing(props.listing.id);
              } else setShowLogInModal(true);
            }}
          >
            <FaHeart title={`${props.saved ? 'Unsave' : 'Save'} listing`} />
          </div>
        )}
      </>
    );
  };

  const renderEditBtn = (): JSX.Element => {
    return (
      <>
        {props.user && props.user.id === props.listing.owner.id && (
          <Link to={`/listings/edit/${props.listing.id}`}>
            <div className="listing-card__icon-btn listing-card__icon-btn--edit">
              <FaEdit title="Edit your listing" />
            </div>
          </Link>
        )}
      </>
    );
  };

  const renderDeleteBtn = (): JSX.Element => {
    return (
      <>
        {props.user && props.user.id === props.listing.owner.id && (
          <div className="listing-card__icon-btn listing-card__icon-btn--delete">
            <MdDelete title="Delete listing" />
          </div>
        )}
      </>
    );
  };

  return (
    <div className="listing-card">
      <div className="listing-card__photos">
        {showImageSlider && (
          <ImageSlider
            images={props.listing.photos}
            containerClassName="listing-card__photos"
            pagination
            linkTo={`/listings/${props.listing.id}`}
            backgroundSize="cover"
            bordered
            squared
          />
        )}
      </div>

      <div className="listing-card__info">{props.renderInfoContent()}</div>

      <div className="listing-card__icon-btns">
        {props.showSavedBtn && renderSaveBtn()}
        {props.showEditBtn && renderEditBtn()}
        {props.showDeleteBtn && renderDeleteBtn()}
      </div>

      {promptUserToLogInToSaveListing(showLogInModal, () =>
        setShowLogInModal(false)
      )}
    </div>
  );
};

const mapStateToProps = (state: StoreState) => {
  return { user: state.user };
};

export const ListingCard = connect(mapStateToProps, {
  saveListing,
  unsaveListing,
})(_ListingCard);

interface ListingCardPublicProps {
  listing: ListingDoc;
  distanceDiff: number;
  saved: boolean;
}

export const ListingCardPublic = (
  props: ListingCardPublicProps
): JSX.Element => {
  const renderContent = () => {
    return (
      <>
        <p className="sub-heading-quinary">{`${
          props.listing.location.city
        } · ${props.distanceDiff.toFixed(1)} mi`}</p>
        <Link
          to={`/listings/${props.listing.id}`}
          className="listing-card__info__title heading-tertiary u-margin-top-xxsmall"
        >
          {props.listing.title}
        </Link>
        <p className="listing-card__info__price heading-quaternary u-margin-top-xxsmall">
          ${props.listing.price}
        </p>
      </>
    );
  };

  return (
    <ListingCard
      listing={props.listing}
      renderInfoContent={renderContent}
      showSavedBtn
      saved={props.saved}
    />
  );
};

interface ListingCardPrivateProps {
  listing: ListingDoc;
  showEditBtn?: boolean;
  btnText: string;
  btnAction(): void;
}

export const ListingCardPrivate = (
  props: ListingCardPrivateProps
): JSX.Element => {
  const renderContent = () => {
    return (
      <>
        <Link
          to={`/listings/${props.listing.id}`}
          className="listing-card__info__title heading-quaternary"
        >
          {props.listing.title}
        </Link>
        <p className="sub-heading-quinary u-margin-top-xxsmall">{`${props.listing.visits} visits · ${props.listing.favorites} favorites`}</p>

        <p
          className="btn-text btn-text--orange u-margin-top-xxsmall"
          onClick={props.btnAction}
        >
          {props.btnText}
        </p>
      </>
    );
  };

  return (
    <ListingCard
      listing={props.listing}
      renderInfoContent={renderContent}
      showEditBtn={props.showEditBtn ? true : false}
      showDeleteBtn
    />
  );
};
