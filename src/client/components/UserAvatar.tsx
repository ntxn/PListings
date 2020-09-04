import React from 'react';
import { BsPersonFill } from 'react-icons/bs';

import { UserDoc } from '../../common';

interface UserAvatarProps {
  onClick?(): void;
  user: UserDoc;
  className: string;
}

export const UserAvatar = (props: UserAvatarProps): JSX.Element => {
  return (
    <div onClick={props.onClick}>
      {props.user.photo ? (
        <img
          src={`/img/users/${props.user.photo}`}
          alt={`${props.user.name} photo`}
          className={props.className}
        />
      ) : (
        <div className={props.className}>
          <BsPersonFill title="Default Avatar" />
        </div>
      )}
    </div>
  );
};
