import React, { useEffect, useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { FaHeart } from 'react-icons/fa';
import { AiFillEye, AiOutlineMessage } from 'react-icons/ai';
import { FiEdit } from 'react-icons/fi';

import {
  ChatroomDocClient,
  StoreState,
  listingMapSmall,
  listingMapLarge,
  getTimeAgo,
} from '../../utilities';
import {
  clearListing,
  saveListing,
  unsaveListing,
  initiateConversation,
} from '../../actions';
import { ListingDoc, UserDoc } from '../../../common';
import { ImageSlider } from '../ImageSlider';
import { Avatar } from '../UserAvatar';
import { MapModal, promptUserToLogInToSaveListing, Loader } from '../Modal';

interface ListingProps {
  listing: ListingDoc | null;
  user: UserDoc | null;

  savedListings: Record<string, string>;
  sockets: Record<string, SocketIOClient.Socket>;
  chatrooms: Record<string, ChatroomDocClient>;

  clearListing(): void;
  saveListing(listingId: string): void;
  unsaveListing(listingId: string): void;
  initiateConversation(msg: string): void;
}

const _Listing = (props: ListingProps): JSX.Element => {
  const [showMapModal, setShowMapModal] = useState(false);
  const [showLogInModal, setShowLogInModal] = useState(false);
  const [showLoader, setShowLoader] = useState(false);
  const [showImageSlider, setShowImageSlider] = useState(false);
  const [chatboxContent, setChatboxContent] = useState('');

  useEffect(() => {
    return () => {
      if (props.listing) props.clearListing();
    };
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

  const onSubmitChatbox = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();

    if (props.user) props.initiateConversation(chatboxContent);
    else setShowLogInModal(true);
  };
  const { photos, category, subcategory, title, owner, id } = props.listing!;
  const { visits, price, favorites, condition, brand } = props.listing!;
  const { description, location, createdAt } = props.listing!;

  return (
    <div className="listing">
      <div className="listing__photos">
        {showImageSlider && (
          <ImageSlider
            images={photos}
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
          {category} › {subcategory}
        </p>
        <div className="listing__info__title">
          <h1
            className="heading-primary"
            style={{ fontWeight: 700, lineHeight: 1.2 }}
          >
            {title}
          </h1>
          {props.user && props.user.id === owner.id ? (
            <Link to={`/listings/edit/${id}`} className="listing__info__edit">
              <FiEdit />
            </Link>
          ) : (
            <div
              className={`listing__info__heart listing__info__heart--${
                props.savedListings[id] ? 'red' : 'gray'
              }`}
              onClick={() => {
                if (props.user) {
                  if (props.savedListings[id]) props.unsaveListing(id);
                  else props.saveListing(id);
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
          {price > 0 ? '$' + price : 'Free'}
        </h2>

        <div className="listing__info__stats sub-heading-quaternary">
          <div className="listing__info__stats--time">
            {getTimeAgo(createdAt)}
          </div>
          <div className="listing__info__stats--seens-likes">
            <div>
              <AiFillEye /> {visits}
            </div>
            <div>
              <FaHeart /> {favorites}
            </div>
          </div>
        </div>

        {/******** Listing Details ********/}

        {(condition || brand || description) && (
          <div className="listing__info__details u-margin-top-small">
            <h3 className="heading-tertiary u-margin-bottom-small">Details</h3>
            {brand && (
              <div className="paragraph-small-font-size">
                <div>Brand</div> {brand}
              </div>
            )}
            {condition && (
              <div className="paragraph-small-font-size">
                <div>Condition</div> {condition}
              </div>
            )}
            {description && (
              <p className="paragraph-small-font-size u-margin-top-xxsmall">
                {description}
              </p>
            )}
          </div>
        )}

        {/******** Listing's Seller info (avatar, name, rating) ********/}
        <hr className="u-divider u-margin-top-small" />
        <div className="listing__info__owner u-margin-top-medium">
          <Avatar user={owner} className="avatar--icon" useLink />
          <div className="listing__info__owner__info">
            <div className="listing__info__owner__info--name">{owner.name}</div>
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

              listingMapLarge(process.env.MAPBOX_KEY!, location.coordinates);
            }, 50);
          }}
        ></div>

        <div className="listing__info__location paragraph-small-font-size">
          {`${location.city}, ${location.state} ${location.zip}`}
        </div>

        {/******** Mini chat box ********/}
        {!props.user ||
          (props.user.id != owner.id && (
            <div className="listing__mini-chatbox u-margin-top-small">
              {props.sockets[`/${id}`] ? (
                <Link to="/messages" className="listing__mini-chatbox__title">
                  <AiOutlineMessage />
                  <span>View conversations</span>
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

const mapStateToProps = (state: StoreState) => {
  return {
    listing: state.listing,
    user: state.user,
    savedListings: state.savedListingIds,
    sockets: state.sockets,
    chatrooms: state.chatrooms,
  };
};

export const Listing = connect(mapStateToProps, {
  clearListing,
  saveListing,
  unsaveListing,
  initiateConversation,
})(_Listing);
