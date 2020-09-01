import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { FaHeart } from 'react-icons/fa';
import { AiFillEye } from 'react-icons/ai';
import { FiEdit } from 'react-icons/fi';

import { StoreState, listingMapSmall, listingMapLarge } from '../../utilities';
import {
  fetchListing,
  clearListing,
  saveListing,
  unsaveListing,
} from '../../actions';
import { ListingDoc, UserDoc } from '../../../server/models';
import { BtnLoader } from '../Loader';
import { ImageSlider } from '../ImageSlider';
import { UserAvatar } from '../UserAvatar';
import { MapModal, ConfirmationModal } from '../Modal';
import { history } from '../../history';

interface ListingProps {
  listing: ListingDoc;
  user: UserDoc | null;
  listingSaved: boolean;
  fetchListing(id: string): void;
  clearListing(): void;
  saveListing(listingId: string): void;
  unsaveListing(listingId: string): void;
}

const _Listing = (props: ListingProps): JSX.Element => {
  useEffect(() => {
    const fetchData = async () => {
      //@ts-ignore
      await props.fetchListing(props.match.params.id);
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (props.listing) {
      // Use MutationObserver to listen to the changes in the DOM to wait for listing__photos to be rendered
      const photosElement = document.querySelector('.listing__photos');
      const observer = new MutationObserver((mutations, observer) => {
        if (document.contains(photosElement)) {
          setShowImageSlider(true);
          observer.disconnect();
        }
      });
      const options = {
        attributes: false,
        childList: true,
        characterData: false,
        subtree: true,
      };

      observer.observe(document.body, options);

      const map = document.getElementById('listing-map-small');
      if (map)
        listingMapSmall(
          process.env.MAPBOX_KEY!,
          props.listing.location.coordinates
        );
    }
  }, [props.listing]);

  // Calculate when the listing was posted
  const getTimePosted = (): string => {
    const listingTime = new Date(props.listing.createdAt).getTime();
    const now = new Date().getTime();
    let diff = Math.round((now - listingTime) / (1000 * 60)); // minutes
    if (diff < 60) return `${diff}m`;

    diff = Math.round(diff / 60); // hours
    if (diff < 24) return `${diff}h`;

    diff = Math.round(diff / 24); // days
    if (diff < 7) return `${diff} day${diff === 1 ? '' : 's'}`;

    diff = Math.round(diff / 7); // weeks
    if (diff < 4) return `${diff} week${diff === 1 ? '' : 's'}`;

    diff = Math.round(diff / 4); // months
    return `${diff} month${diff === 1 ? '' : 's'}`;
  };

  const [showMapModal, setShowMapModal] = useState(false);
  const [showLogInModal, setShowLogInModal] = useState(false);
  const [showLoader, setShowLoader] = useState(false);
  const [showImageSlider, setShowImageSlider] = useState(false);

  const renderListing = (): JSX.Element => {
    return (
      <div className="listing">
        <div className="listing__photos">
          {showImageSlider && (
            <ImageSlider
              images={props.listing.photos}
              containerClassName="listing__photos"
              arrowDisabled
              pagination
              thumbnails
              clearListing={props.clearListing}
            />
          )}
        </div>
        <div className="listing__info">
          {/******** Listing Title, Price & stats ********/}

          <p className="sub-heading-quaternary u-margin-bottom-xsmall">
            {props.listing.category} › {props.listing.subcategory}
          </p>
          <div className="listing__info__title">
            <h1
              className="heading-primary"
              style={{ fontWeight: 700, lineHeight: 1.2 }}
            >
              {props.listing.title}
            </h1>
            {props.user && props.user.id === props.listing.owner.id ? (
              <Link
                to={`/listings/edit/${props.listing.id}`}
                className="listing__info__edit"
              >
                <FiEdit />
              </Link>
            ) : (
              <div
                className={`listing__info__heart listing__info__heart--${
                  props.listingSaved ? 'red' : 'gray'
                }`}
                onClick={() => {
                  if (props.user) {
                    if (props.listingSaved)
                      props.unsaveListing(props.listing.id);
                    else props.saveListing(props.listing.id);
                  } else setShowLogInModal(true);
                }}
              >
                <FaHeart />
              </div>
            )}
            {
              /* If user is not logged in, prompt them to log in in order to save a listing */
              showLogInModal && (
                <ConfirmationModal
                  title="Save listing"
                  content="Please log in to your account or sign up for a new account to save a listing"
                  confirmBtnText="Proceed To Log In"
                  action={() => history.push('/auth/login')}
                  closeModal={() => setShowLogInModal(false)}
                />
              )
            }
          </div>

          <h2 className="heading-secondary u-margin-bottom-xsmall">
            {props.listing.price > 0 ? '$' + props.listing.price : 'Free'}
          </h2>

          <div className="listing__info__stats sub-heading-quaternary">
            <div className="listing__info__stats--time">{getTimePosted()}</div>
            <div className="listing__info__stats--seens-likes">
              <div>
                <AiFillEye /> {props.listing.visits}
              </div>
              <div>
                <FaHeart /> {props.listing.favorites}
              </div>
            </div>
          </div>

          {/******** Listing Details ********/}

          {(props.listing.condition ||
            props.listing.brand ||
            props.listing.description) && (
            <div className="listing__info__details u-margin-top-small">
              <h3 className="heading-tertiary u-margin-bottom-small">
                Details
              </h3>
              {props.listing.brand && (
                <div className="paragraph-small-font-size">
                  <div>Brand</div> {props.listing.brand}
                </div>
              )}
              {props.listing.condition && (
                <div className="paragraph-small-font-size">
                  <div>Condition</div> {props.listing.condition}
                </div>
              )}
              {props.listing.description && (
                <p className="paragraph-small-font-size u-margin-top-xxsmall">
                  {props.listing.description}
                </p>
              )}
            </div>
          )}

          {/******** Listing's Seller info (avatar, name, rating) ********/}
          <hr className="u-divider u-margin-top-small" />
          <div className="listing__info__owner u-margin-top-medium">
            <Link to={`/user/${props.listing.owner.id}`}>
              <UserAvatar user={props.listing.owner} className="icon" />
            </Link>
            <div className="listing__info__owner__info">
              <div className="listing__info__owner__info--name">
                {props.listing.owner.name}
              </div>
            </div>
          </div>

          {/******** Listing Location on Map ********/}
          <div
            id="listing-map-small"
            className="listing__info__map--small u-margin-top-small"
            onClick={() => {
              setShowMapModal(true);

              setShowLoader(true);

              setTimeout(() => {
                setShowLoader(false);
                const header = document.querySelector(
                  '.container__center-content-horizontally'
                );

                header!.classList.add('u-z-index-0');

                listingMapLarge(
                  process.env.MAPBOX_KEY!,
                  props.listing.location.coordinates
                );
              }, 50);
            }}
          ></div>

          <div className="listing__info__location paragraph-small-font-size">
            {`${props.listing.location.city}, ${props.listing.location.state} ${props.listing.location.zip}`}
          </div>
          {showLoader && <BtnLoader />}
          {showMapModal && (
            <MapModal
              close={() => {
                setShowMapModal(false);
                const header = document.querySelector(
                  '.container__center-content-horizontally'
                );

                header!.classList.remove('u-z-index-0');
              }}
            />
          )}

          {/******** Mini chat box ********/}
        </div>
      </div>
    );
  };

  return <>{props.listing ? renderListing() : <BtnLoader />}</>;
};

const mapStateToProps = (state: StoreState) => {
  return {
    listing: state.listing,
    user: state.user,
    listingSaved: state.listingSaved,
  };
};

export const Listing = connect(mapStateToProps, {
  fetchListing,
  clearListing,
  saveListing,
  unsaveListing,
})(
  //@ts-ignore
  _Listing
);
