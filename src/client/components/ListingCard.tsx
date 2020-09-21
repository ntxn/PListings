import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { FaHeart } from 'react-icons/fa';
import { FaEdit } from 'react-icons/fa';
import { MdDelete } from 'react-icons/md';

import { ListingDoc, UserDoc, ApiRoutes } from '../../common';
import { ImageSlider } from './ImageSlider';
import { showAlert, AlertType } from './alert';
import { promptUserToLogInToSaveListing } from './Modal';
import { StoreState } from '../utilities';
import { unsaveListing, saveListing } from '../actions';

interface ListingCardProps {
  // from Parent component
  listing: ListingDoc;
  renderInfoContent(): JSX.Element;

  // Props for public card
  showSavedBtn?: boolean;
  saved?: boolean;
  clickable?: boolean;

  // Props for private card
  showEditBtn?: boolean;
  showDeleteBtn?: boolean;
  onDelete?(): void;

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

  const deleteListing = async (id: string): Promise<void> => {
    try {
      await axios.delete(`${ApiRoutes.Listings}/${id}`);
      props.onDelete!();
    } catch (err) {
      showAlert(
        AlertType.Error,
        'Having issue deleting this listing. Please try again later'
      );
      console.log(err);
    }
  };

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
          <div
            className="listing-card__icon-btn listing-card__icon-btn--delete"
            onClick={() => deleteListing(props.listing.id)}
          >
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
            linkTo={
              props.clickable ? `/listings/${props.listing.id}` : undefined
            }
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

const ListingCard = connect(mapStateToProps, {
  saveListing,
  unsaveListing,
})(_ListingCard);

interface ListingCardPublicProps {
  listing: ListingDoc;
  distanceDiff: number;
  saved: boolean;
  clickable?: boolean;
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
        {props.clickable ? (
          <Link
            to={`/listings/${props.listing.id}`}
            className="listing-card__info__title heading-tertiary u-margin-top-xxsmall"
          >
            {props.listing.title}
          </Link>
        ) : (
          <h3 className="listing-card__info__title heading-tertiary u-margin-top-xxsmall">
            {props.listing.title}
          </h3>
        )}
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
      showSavedBtn={props.clickable}
      saved={props.saved}
      clickable={props.clickable}
    />
  );
};

interface ListingCardPrivateProps {
  listing: ListingDoc;
  showEditBtn?: boolean;
  btnText: string;
  btnAction(): void;
  onDelete(): void;
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
      onDelete={props.onDelete}
    />
  );
};
