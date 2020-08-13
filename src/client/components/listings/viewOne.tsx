import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { StoreState } from '../../utilities';
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
        <div className="listing__info">Info</div>
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
