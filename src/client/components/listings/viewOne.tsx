import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { FaHeart } from 'react-icons/fa';
import { AiFillEye } from 'react-icons/ai';

import { StoreState, UserAvatar } from '../../utilities';
import { fetchListing } from '../../actions';
import { ListingDoc } from '../../../server/models';
import { BtnLoader } from '../Loader';
import { ArrowBtn } from '../ArrowBtn';

interface ListingProps {
  listing: ListingDoc;
  fetchListing(id: string): void;
}

const THUMBNAIL_SIZE = 5.5; // width & height is 5rem + right margin 0.5rem
const MAX_OFFSET = THUMBNAIL_SIZE * 2;

const _Listing = (props: ListingProps): JSX.Element => {
  useEffect(() => {
    const fetchData = async () => {
      //@ts-ignore
      await props.fetchListing(props.match.params.id);
      const thumbnailsPartial = document.querySelector(
        '.listing__photos__thumbnails--partial'
      );
      setThumbnailsPartialWidth(
        thumbnailsPartial!.getBoundingClientRect().width / 10
      );
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (props.listing)
      setThumbnailsFullWidth(
        props.listing.photos.length * THUMBNAIL_SIZE - 0.5
      ); // last thumbnail doesn't have right margin
  }, [props.listing]);

  const getTimePosted = (): string => {
    const listingTime = new Date(props.listing.createdAt).getTime();
    const now = new Date().getTime();
    let diff = Math.round((now - listingTime) / (1000 * 60)); // minutes
    if (diff < 60) return `${diff}m`;

    diff = Math.round(diff / 60); // hours
    if (diff < 24) return `${diff}h`;

    diff = Math.round(diff / 24); // days
    if (diff < 7) return `${diff} days`;

    diff = Math.round(diff / 7); // weeks
    if (diff < 4) return `${diff} weeks`;

    diff = Math.round(diff / 4); // months
    return `${diff} months`;
  };

  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [thumbnailsLeftPosition, setThumbnailsLeftPosition] = useState(0);
  const [thumbnailsPartialWidth, setThumbnailsPartialWidth] = useState(0);
  const [thumbnailsFullWidth, setThumbnailsFullWidth] = useState(0);

  const renderListing = (): JSX.Element => {
    return (
      <div className="listing">
        <div className="listing__photos">
          <div className="listing__photos__selected--container">
            <div className="listing__photos__selected--image">
              <img
                src={`/img/listings/${props.listing.photos[currentPhotoIndex]}`}
              />
            </div>
            <ArrowBtn
              direction="back"
              onClick={() => setCurrentPhotoIndex(currentPhotoIndex - 1)}
              topPosition="25rem"
              margin="1rem"
              disabled={currentPhotoIndex === 0}
              isRound={true}
            />
            <ArrowBtn
              direction="forward"
              onClick={() => setCurrentPhotoIndex(currentPhotoIndex + 1)}
              topPosition="25rem"
              margin="1rem"
              disabled={currentPhotoIndex === props.listing.photos.length - 1}
              isRound={true}
            />
          </div>
          <div className="listing__photos__thumbnails--container">
            <div className="listing__photos__thumbnails--partial">
              <div
                className="listing__photos__thumbnails--full"
                style={{
                  transform: `translateX(${thumbnailsLeftPosition}rem)`,
                }}
              >
                {props.listing.photos.map((filename, i) => (
                  <img
                    key={i}
                    src={`/img/listings/${filename}`}
                    onClick={() => setCurrentPhotoIndex(i)}
                    className={`listing__photos__thumbnail ${
                      i === currentPhotoIndex
                        ? 'listing__photos__thumbnail--selected'
                        : ''
                    }`}
                  />
                ))}
              </div>
            </div>
            {thumbnailsPartialWidth < thumbnailsFullWidth && (
              <>
                <ArrowBtn
                  direction="back"
                  onClick={() => {
                    const offset =
                      thumbnailsLeftPosition + MAX_OFFSET <= 0
                        ? MAX_OFFSET
                        : -thumbnailsLeftPosition;

                    setThumbnailsLeftPosition(thumbnailsLeftPosition + offset);
                  }}
                  topPosition="2.5rem"
                  disabled={thumbnailsLeftPosition === 0}
                />
                <ArrowBtn
                  direction="forward"
                  onClick={() => {
                    const width = thumbnailsFullWidth + thumbnailsLeftPosition;
                    const offset =
                      width - MAX_OFFSET > thumbnailsPartialWidth
                        ? MAX_OFFSET
                        : width - thumbnailsPartialWidth;

                    setThumbnailsLeftPosition(thumbnailsLeftPosition - offset);
                  }}
                  topPosition="2.5rem"
                  disabled={
                    thumbnailsLeftPosition ===
                    thumbnailsPartialWidth - thumbnailsFullWidth
                  }
                />
              </>
            )}
          </div>
        </div>
        <div className="listing__info">
          {/******** Listing Title, Price & stats ********/}

          <p className="sub-heading-quaternary u-margin-bottom-xsmall">
            {props.listing.category} › {props.listing.subcategory}
          </p>
          <div className="listing__info__title-heart">
            <h1
              className="heading-primary"
              style={{ fontWeight: 700, lineHeight: 1.2 }}
            >
              {props.listing.title}
            </h1>
            <div className="listing__info__heart listing__info__heart--gray">
              <FaHeart />
            </div>
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
          <div className="listing__info__owner">
            <Link to={`/user/${props.listing.owner.id}`}>
              <UserAvatar user={props.listing.owner} className="icon" />
            </Link>
          </div>

          {/******** Listing Location on Map ********/}

          {/******** Mini chat box ********/}
        </div>
      </div>
    );
  };

  return <>{props.listing ? renderListing() : <BtnLoader />}</>;
};

const mapStateToProps = (state: StoreState) => {
  return { listing: state.listing };
};

//@ts-ignore
export const Listing = connect(mapStateToProps, { fetchListing })(_Listing);
