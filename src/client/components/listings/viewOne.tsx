import React, { useEffect, useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { FaHeart } from 'react-icons/fa';
import { AiFillEye, AiOutlineMessage } from 'react-icons/ai';
import { FiEdit } from 'react-icons/fi';

import { StoreState, listingMapSmall, listingMapLarge } from '../../utilities';
import {
  fetchListing,
  clearListing,
  saveListing,
  unsaveListing,
  initiateConversation,
} from '../../actions';
import { ListingDoc, UserDoc } from '../../../common';
import { ImageSlider } from '../ImageSlider';
import { UserAvatar } from '../UserAvatar';
import { MapModal, promptUserToLogInToSaveListing, Loader } from '../Modal';

interface ListingProps {
  listing: ListingDoc | null;
  user: UserDoc | null;
  savedListings: Record<string, string>;
  sockets: Record<string, SocketIOClient.Socket>;

  fetchListing(id: string): void;
  clearListing(): void;
  saveListing(listingId: string): void;
  unsaveListing(listingId: string): void;
  initiateConversation(msg: string): void;

  match: { params: { id: string } };
}

const _Listing = (props: ListingProps): JSX.Element => {
  useEffect(() => {
    const fetchData = async () => {
      await props.fetchListing(props.match.params.id);
    };

    fetchData();
    return () => props.clearListing();
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
    const listingTime = new Date(props.listing!.createdAt).getTime();
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
  const [chatboxContent, setChatboxContent] = useState('');

  const onSubmitChatbox = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();

    if (props.user) props.initiateConversation(chatboxContent);
    else setShowLogInModal(true);
  };

  const renderListing = (): JSX.Element => {
    const listing = props.listing!;

    return (
      <div className="listing">
        <div className="listing__photos">
          {showImageSlider && (
            <ImageSlider
              images={listing.photos}
              containerClassName="listing__photos"
              arrowDisabled
              pagination
              thumbnails
            />
          )}
        </div>
        <div className="listing__info">
          {/******** Listing Title, Price & stats ********/}

          <p className="sub-heading-quaternary u-margin-bottom-xsmall">
            {listing.category} › {listing.subcategory}
          </p>
          <div className="listing__info__title">
            <h1
              className="heading-primary"
              style={{ fontWeight: 700, lineHeight: 1.2 }}
            >
              {listing.title}
            </h1>
            {props.user && props.user.id === listing.owner.id ? (
              <Link
                to={`/listings/edit/${listing.id}`}
                className="listing__info__edit"
              >
                <FiEdit />
              </Link>
            ) : (
              <div
                className={`listing__info__heart listing__info__heart--${
                  props.savedListings[listing.id] ? 'red' : 'gray'
                }`}
                onClick={() => {
                  if (props.user) {
                    if (props.savedListings[listing.id])
                      props.unsaveListing(listing.id);
                    else props.saveListing(listing.id);
                  } else setShowLogInModal(true);
                }}
              >
                <FaHeart />
              </div>
            )}
            {promptUserToLogInToSaveListing(showLogInModal, () =>
              setShowLogInModal(false)
            )}
          </div>

          <h2 className="heading-secondary u-margin-bottom-xsmall">
            {listing.price > 0 ? '$' + listing.price : 'Free'}
          </h2>

          <div className="listing__info__stats sub-heading-quaternary">
            <div className="listing__info__stats--time">{getTimePosted()}</div>
            <div className="listing__info__stats--seens-likes">
              <div>
                <AiFillEye /> {listing.visits}
              </div>
              <div>
                <FaHeart /> {listing.favorites}
              </div>
            </div>
          </div>

          {/******** Listing Details ********/}

          {(listing.condition || listing.brand || listing.description) && (
            <div className="listing__info__details u-margin-top-small">
              <h3 className="heading-tertiary u-margin-bottom-small">
                Details
              </h3>
              {listing.brand && (
                <div className="paragraph-small-font-size">
                  <div>Brand</div> {listing.brand}
                </div>
              )}
              {listing.condition && (
                <div className="paragraph-small-font-size">
                  <div>Condition</div> {listing.condition}
                </div>
              )}
              {listing.description && (
                <p className="paragraph-small-font-size u-margin-top-xxsmall">
                  {listing.description}
                </p>
              )}
            </div>
          )}

          {/******** Listing's Seller info (avatar, name, rating) ********/}
          <hr className="u-divider u-margin-top-small" />
          <div className="listing__info__owner u-margin-top-medium">
            <Link to={`/user/profile/${listing.owner.id}`}>
              <UserAvatar user={listing.owner} className="icon" />
            </Link>
            <div className="listing__info__owner__info">
              <div className="listing__info__owner__info--name">
                {listing.owner.name}
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
                  listing.location.coordinates
                );
              }, 50);
            }}
          ></div>

          <div className="listing__info__location paragraph-small-font-size">
            {`${listing.location.city}, ${listing.location.state} ${listing.location.zip}`}
          </div>

          {/******** Mini chat box ********/}
          {!props.user ||
            (props.user.id != listing.owner.id && (
              <div className="listing__mini-chatbox u-margin-top-small">
                {props.sockets[`/${listing.id}`] ? (
                  <Link to="" className="listing__mini-chatbox__title">
                    <AiOutlineMessage />
                    <span>Go to Conversation</span>
                  </Link>
                ) : (
                  <>
                    <p className="listing__mini-chatbox__title">
                      <AiOutlineMessage />
                      <span>Send seller a message</span>
                    </p>
                    <form
                      onSubmit={onSubmitChatbox}
                      className="listing__mini-chatbox__form"
                    >
                      <input
                        value={chatboxContent}
                        onChange={e => setChatboxContent(e.target.value)}
                        placeholder="Is it available?"
                        className="listing__mini-chatbox__input"
                      />
                      <button
                        type="submit"
                        disabled={chatboxContent === ''}
                        className="listing__mini-chatbox__btn"
                      >
                        Send
                      </button>
                    </form>
                  </>
                )}
              </div>
            ))}

          {/************** Loader & Modal **************/}
          {showLoader && <Loader />}
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
        </div>
      </div>
    );
  };

  return <>{props.listing ? renderListing() : <Loader />}</>;
};

const mapStateToProps = (state: StoreState) => {
  return {
    listing: state.listing,
    user: state.user,
    savedListings: state.savedListingIds,
    sockets: state.sockets,
  };
};

export const Listing = connect(mapStateToProps, {
  fetchListing,
  clearListing,
  saveListing,
  unsaveListing,
  initiateConversation,
})(_Listing);
