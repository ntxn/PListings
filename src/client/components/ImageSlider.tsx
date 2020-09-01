import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

import { ArrowBtn } from './ArrowBtn';

interface ImageSliderProps {
  images: string[];
  containerClassName: string;
  arrowDisabled?: boolean;
  pagination?: boolean;
  thumbnails?: boolean;
  autoPlay?: boolean;
  autoPlayInterval?: number;
  linkTo?: string;
}

const MAX_THUMBNAIL_SIZE = 5; // width & height is 5rem
const THUMBNAIL_MARGIN_RIGHT = 0.5;
const INITIAL_THUMBNAILS_ATTR = {
  showArrows: false,
  leftPosition: 0,
  leftBound: 0,
  rightBound: 0,
  arrowTopPosition: 2.5,
  height: MAX_THUMBNAIL_SIZE,
  maxOffset: (MAX_THUMBNAIL_SIZE + THUMBNAIL_MARGIN_RIGHT) * 2,
};

//TODO: don't allow ImageSlider to load props from the prev render

// Slider - main component
export const ImageSlider = (props: ImageSliderProps): JSX.Element => {
  const { images, containerClassName } = props;

  // Get container's width & height
  const getContainerMeasurement = (): { width: number; height: number } => {
    const { width, height } = document
      .querySelector(`.${containerClassName}`)!
      .getBoundingClientRect();

    return { width: width / 10, height: height / 10 };
  };

  const getArrowTopPosition = () =>
    (getContainerMeasurement().height * (props.thumbnails ? 0.9 : 1) - 1) / 2;

  const [thumbnails, setThumbnails] = useState(INITIAL_THUMBNAILS_ATTR);
  const [state, setState] = useState({
    activeSlide: 0,
    translate: 0,
    transition: 0.45,
    arrowTopPosition: getArrowTopPosition(),
  });

  const { activeSlide, translate, transition } = state;

  const getThumbnailsNextLeftPosition = (
    direction: string,
    offset: number
  ): number => {
    const forward = direction === 'forward';
    const { leftPosition, rightBound, leftBound } = thumbnails;
    const nextPos = forward ? leftPosition - offset : leftPosition + offset;

    if (forward) return nextPos >= rightBound ? nextPos : rightBound;
    return nextPos <= leftBound ? nextPos : leftBound;
  };

  const setNextSlide = (nextSlideIndex: number): void => {
    setState({
      ...state,
      translate: nextSlideIndex * getContainerMeasurement().width,
      activeSlide: nextSlideIndex,
    });
  };

  const nextSlide = () => {
    if (activeSlide === images.length - 1) {
      if (props.thumbnails)
        setThumbnails({ ...thumbnails, leftPosition: thumbnails.leftBound });
      return setNextSlide(0);
    }

    setNextSlide(activeSlide + 1);

    if (props.thumbnails)
      setThumbnails({
        ...thumbnails,
        leftPosition: getThumbnailsNextLeftPosition(
          'forward',
          thumbnails.height + THUMBNAIL_MARGIN_RIGHT
        ),
      });
  };

  const prevSlide = () => {
    if (activeSlide === 0) {
      if (props.thumbnails)
        setThumbnails({ ...thumbnails, leftPosition: thumbnails.rightBound });
      return setNextSlide(images.length - 1);
    }

    setNextSlide(activeSlide - 1);

    if (props.thumbnails)
      setThumbnails({
        ...thumbnails,
        leftPosition: getThumbnailsNextLeftPosition(
          'back',
          thumbnails.height + THUMBNAIL_MARGIN_RIGHT
        ),
      });
  };

  const calcThumbnailsValues = () => {
    // Get the thumbnail's height
    const thumbnailsHeight = getContainerMeasurement().height * 0.1;
    const thumbnailSize =
      thumbnailsHeight > MAX_THUMBNAIL_SIZE
        ? MAX_THUMBNAIL_SIZE
        : thumbnailsHeight;

    // Get thumbnails' other attributes
    const thumbnailsPartial = document.querySelector(
      '.image-slider__thumbnails--partial'
    );

    if (document.contains(thumbnailsPartial)) {
      const partialWidth =
        thumbnailsPartial!.getBoundingClientRect().width / 10;

      // last thumbnail doesn't have right margin
      const fullWidth =
        images.length * (thumbnailSize + THUMBNAIL_MARGIN_RIGHT) -
        THUMBNAIL_MARGIN_RIGHT;

      if (partialWidth < fullWidth) {
        const leftPosition = (fullWidth - partialWidth) / 2;

        setThumbnails({
          height: thumbnailSize,
          maxOffset: (thumbnailSize + THUMBNAIL_MARGIN_RIGHT) * 2,
          arrowTopPosition: thumbnailSize / 2,
          showArrows: true,
          leftPosition,
          leftBound: leftPosition,
          rightBound: -leftPosition,
        });
      } else
        setThumbnails({
          ...INITIAL_THUMBNAILS_ATTR,
          height: thumbnailSize,
          maxOffset: (thumbnailSize + THUMBNAIL_MARGIN_RIGHT) * 2,
          arrowTopPosition: thumbnailSize / 2,
        });
    }
  };

  const handleResize = () => {
    setState({
      ...state,
      transition: 0,
      translate: getContainerMeasurement().width,
      arrowTopPosition: getArrowTopPosition(),
    });

    calcThumbnailsValues();
  };

  const autoPlayRef = useRef<() => void>(nextSlide);
  const resizeRef = useRef<() => void>(handleResize);

  useEffect(() => {
    autoPlayRef.current = nextSlide;
    resizeRef.current = handleResize;
  });

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (images.length > 1 && props.autoPlay) {
      const play = () => autoPlayRef.current();
      interval = setInterval(
        play,
        (props.autoPlayInterval ? props.autoPlayInterval : 3) * 1000
      );
    }

    const resize = () => resizeRef.current();
    const onResize = window.addEventListener('resize', resize);

    return () => {
      if (props.autoPlay) clearInterval(interval);
      // @ts-ignore
      window.removeEventListener('resize', onResize);
    };
  }, []);

  useEffect(() => {
    if (transition === 0) setState({ ...state, transition: 0.45 });
  }, [transition]);

  useEffect(() => {
    if (props.thumbnails) {
      // Use Mutation Observer to wait for the DIV thumbnails--partail to be mounted to
      // decide if we need to display arrows
      const observer = new MutationObserver((mutations, observer) => {
        calcThumbnailsValues();
        observer.disconnect();
      });

      const options = {
        attributes: false,
        childList: true,
        characterData: false,
        subtree: true,
      };
      observer.observe(document.body, options);
    }
  }, [images]);

  const renderImageSliderContent = (): JSX.Element => {
    return (
      <div
        className="image-slider__content"
        style={{
          transform: `translateX(-${translate}rem)`,
          transition: `transform ease-out ${transition}s`,
          width: `${getContainerMeasurement().width * images.length}rem`,
        }}
      >
        {images.map((slide, i) => {
          const extraStyles = {
            width: `${getContainerMeasurement().width}rem`,
            backgroundImage: `url('/img/listings/${slide}')`,
          };
          return (
            <div className="image-slider__slide" style={extraStyles} key={i} />
          );
        })}
      </div>
    );
  };

  return (
    <div
      className="image-slider"
      style={{ height: `${getContainerMeasurement().height}rem` }}
    >
      <div
        className={`image-slider__container ${
          images.length > 1 ? 'u-show-arrow-on-hover' : ''
        }`}
        style={{ height: props.thumbnails ? '90%' : '100%' }}
      >
        {props.linkTo ? (
          <Link to={props.linkTo}>{renderImageSliderContent()}</Link>
        ) : (
          renderImageSliderContent()
        )}

        <ArrowBtn
          direction="back"
          onClick={prevSlide}
          topPosition={`${state.arrowTopPosition}rem`}
          margin="1rem"
          disabled={props.arrowDisabled ? activeSlide === 0 : false}
          isRound={true}
          hide={true}
        />
        <ArrowBtn
          direction="forward"
          onClick={nextSlide}
          topPosition={`${state.arrowTopPosition}rem`}
          margin="1rem"
          disabled={
            props.arrowDisabled ? activeSlide === images.length - 1 : false
          }
          isRound={true}
          hide={true}
        />

        {props.pagination && images.length > 1 && (
          <div className="image-slider__pagination">
            {images.map((image, i) => (
              <span
                className={`image-slider__pagination__dot ${
                  i === activeSlide
                    ? 'image-slider__pagination__dot--active'
                    : ''
                }`}
                key={i}
              />
            ))}
          </div>
        )}
      </div>

      {props.thumbnails && (
        <div className="image-slider__thumbnails">
          <div className="image-slider__thumbnails--partial">
            <div
              className="image-slider__thumbnails--full"
              style={{
                transform: `translateX(${thumbnails.leftPosition}rem)`,
              }}
            >
              {images.map((filename, i) => (
                <img
                  key={i}
                  src={`/img/listings/${filename}`}
                  onClick={() => setNextSlide(i)}
                  className={`image-slider__thumbnail ${
                    i === activeSlide ? 'image-slider__thumbnail--selected' : ''
                  }`}
                  style={{
                    height: `${thumbnails.height}rem`,
                    width: `${thumbnails.height}rem`,
                  }}
                />
              ))}
            </div>
          </div>
          {thumbnails.showArrows && (
            <>
              <ArrowBtn
                direction="back"
                onClick={() => {
                  setThumbnails({
                    ...thumbnails,
                    leftPosition: getThumbnailsNextLeftPosition(
                      'back',
                      thumbnails.maxOffset
                    ),
                  });
                }}
                topPosition={`${thumbnails.height / 2}rem`}
                disabled={thumbnails.leftPosition === thumbnails.leftBound}
              />
              <ArrowBtn
                direction="forward"
                onClick={() => {
                  setThumbnails({
                    ...thumbnails,
                    leftPosition: getThumbnailsNextLeftPosition(
                      'forward',
                      thumbnails.maxOffset
                    ),
                  });
                }}
                topPosition={`${thumbnails.height / 2}rem`}
                disabled={thumbnails.leftPosition === thumbnails.rightBound}
              />
            </>
          )}
        </div>
      )}
    </div>
  );
};
