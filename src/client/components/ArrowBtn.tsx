import React from 'react';
import { IoIosArrowBack, IoIosArrowForward } from 'react-icons/io';

interface ArrowBtnProps {
  direction: string; // back, forward
  isRound?: boolean;
  onClick(): void;
  topPosition: string;
  disabled: boolean;
  margin?: string;
}

export const ArrowBtn = ({
  direction,
  disabled,
  onClick,
  topPosition,
  margin = '0',
  isRound = false,
}: ArrowBtnProps): JSX.Element => {
  const className = `arrow ${direction === 'forward' ? 'arrow--forward' : ''} ${
    disabled ? 'arrow--disabled' : ''
  } ${isRound ? 'arrow--round' : ''}`;

  const extraStyling = { top: topPosition, margin };

  return (
    <button
      className={className}
      onClick={onClick}
      style={extraStyling}
      disabled={disabled}
    >
      {direction === 'back' ? <IoIosArrowBack /> : <IoIosArrowForward />}
    </button>
  );
};
