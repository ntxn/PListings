import React from 'react';
import ClipLoader from 'react-spinners/ClipLoader';

export const BtnLoader = (): JSX.Element => {
  return (
    <div className="btn-loader">
      <ClipLoader size={20} color={'#fff'} />
    </div>
  );
};
