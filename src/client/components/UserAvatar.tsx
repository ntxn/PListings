import React from 'react';
import { Link } from 'react-router-dom';
import { BsPersonFill } from 'react-icons/bs';

import { UserDoc } from '../../common';

interface AvatarProps {
  user: UserDoc;
  className?: string;
  useLink?: boolean;
  onClick?(): void;
}

export const Avatar = (props: AvatarProps): JSX.Element => {
  const renderAvatar = (): JSX.Element => {
    return (
      <div
        className={`avatar ${props.className ? props.className : ''}`}
        onClick={props.onClick}
      >
        {props.user.photo ? (
          <img
            src={`/img/users/${props.user.photo}`}
            alt={`${props.user.name} photo`}
          />
        ) : (
          <BsPersonFill title="Default Avatar" />
        )}
      </div>
    );
  };

  return (
    <>
      {props.useLink ? (
        <Link
          to={`/user/profile/${props.user.id}`}
          className="avatar--link"
          onClick={event => {
            event.stopPropagation();
          }}
        >
          {renderAvatar()}
        </Link>
      ) : (
        renderAvatar()
      )}
    </>
  );
};
