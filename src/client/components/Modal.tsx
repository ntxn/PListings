import React from 'react';
import ReactDOM from 'react-dom';
import { Link } from 'react-router-dom';
import { IconType } from 'react-icons';
import { BsListNested } from 'react-icons/bs';
import { AiFillSetting, AiOutlineMessage } from 'react-icons/ai';
import { RiLogoutBoxRLine } from 'react-icons/ri';
import { IoIosArrowForward, IoIosClose } from 'react-icons/io';
import { MdClose } from 'react-icons/md';
import ClipLoader from 'react-spinners/ClipLoader';

import { UserDoc } from '../../common';
import { Avatar } from './UserAvatar';
import { FiltersForm } from './forms';
import { FilterAttrs } from '../utilities';
import { history } from '../history';

interface ModalProps {
  onDismiss(): void;
  title: string;
  content: string | JSX.Element;
  actions: JSX.Element;
}

interface ConfirmationModalProps {
  title: string;
  content: string | JSX.Element;
  confirmBtnText: string;
  action(): void;
  closeModal(): void;
}

interface UserMenuModalProps {
  user: UserDoc;
  closeUserMenu(): void;
  logout(): void;
}

/***
 * Generic Modal flexible with modal's content, what actions we can do with a modal,
 * and we can easily control what happen when user click outside of the modal.
 */
export const Modal = (props: ModalProps): React.ReactPortal => {
  return ReactDOM.createPortal(
    <div onClick={props.onDismiss} className="modal">
      <div
        onClick={event => event.stopPropagation()}
        className="modal__container u-center-text"
      >
        <div className="heading-secondary u-margin-bottom-small">
          {props.title}
        </div>
        <div className="modal__content u-margin-bottom-medium">
          {props.content}
        </div>
        <div className="modal__actions">{props.actions}</div>
      </div>
    </div>,
    document.querySelector('#modal')!
  );
};

/**
 * Modal built specifically for confirmation purposes, like yes/no question.
 * The Modal has 2 actions: cancel or confirm for the app to take action.
 * Cancel or clicking outside the modal will hide the modal.
 * The modal title, content, confirm button text and action needs to be provided.
 *
 * ConfirmationModal hides the modal by setting the modal status' local state to false.
 */
export const ConfirmationModal = (
  props: ConfirmationModalProps
): JSX.Element => {
  const renderActions = (): JSX.Element => {
    return (
      <>
        <button className="btn btn--filled" onClick={props.closeModal}>
          Cancel
        </button>
        <button
          className="btn btn--outline u-white-bg"
          onClick={() => {
            props.closeModal();
            props.action();
          }}
        >
          {props.confirmBtnText}
        </button>
      </>
    );
  };

  return (
    <Modal
      title={props.title}
      content={props.content}
      actions={renderActions()}
      onDismiss={props.closeModal}
    />
  );
};

/**
 * If user is not logged in, prompt them to log in in order to save a listing
 */
export const promptUserToLogInToSaveListing = (
  show: boolean,
  close: () => void
): JSX.Element => {
  return (
    <>
      {show && (
        <ConfirmationModal
          title="Save listing"
          content="Please log in to your account to save a listing"
          confirmBtnText="Proceed To Log In"
          action={() => history.push('/auth/login')}
          closeModal={close}
        />
      )}
    </>
  );
};

/**
 * A modal to display menu options for authenticated user: settings, listings, logout
 */
export const UserMenuModal = (props: UserMenuModalProps): JSX.Element => {
  const renderMenuItemWithLink = (
    url: string,
    title: string,
    Icon: IconType
  ): JSX.Element => {
    return (
      <div className="user-menu__option">
        <Link
          to={url}
          className="user-menu__option__hover"
          onClick={props.closeUserMenu}
        >
          <div className="user-menu__option__icon icon">
            <Icon />
          </div>
          <div className="user-menu__option__content">
            <span className="heading-quaternary">{title}</span>
            <IoIosArrowForward />
          </div>
        </Link>
      </div>
    );
  };

  return ReactDOM.createPortal(
    <div className="user-menu" onClick={props.closeUserMenu}>
      <div
        className="user-menu__container"
        onClick={event => event.stopPropagation()}
      >
        <div className="user-menu__option">
          <Link
            to={`/user/profile/${props.user.id}`}
            className="user-menu__option__hover"
            onClick={props.closeUserMenu}
          >
            <Avatar user={props.user} className="avatar--user-menu" />
            <div className="user-menu__brief-info">
              <span className="heading-tertiary">{props.user.name}</span>
              <span className="sub-heading-tertiary">
                {props.user.location.city}
              </span>
            </div>
          </Link>
        </div>
        <hr className="u-divider" />
        {renderMenuItemWithLink(
          '/user/account-settings',
          'Settings',
          AiFillSetting
        )}
        {renderMenuItemWithLink('/user/listings', 'Listings', BsListNested)}
        {renderMenuItemWithLink('/messages', 'Messages', AiOutlineMessage)}
        <div className="user-menu__option">
          <div
            className="user-menu__option__hover"
            onClick={() => {
              props.logout();
              props.closeUserMenu();
            }}
          >
            <div className="user-menu__option__icon icon">
              <RiLogoutBoxRLine />
            </div>
            <div className="heading-quaternary">Log Out</div>
          </div>
        </div>
      </div>
    </div>,
    document.querySelector('#modal')!
  );
};

interface MapModalProps {
  close(): void;
}

/***
 * A modal to display a map with the listing's location
 */
export const MapModal = (props: MapModalProps): React.ReactPortal => {
  return ReactDOM.createPortal(
    <div className="listing__info__map--large">
      <div id="listing-map-large"></div>
      <div className="icon-close-btn" onClick={props.close}>
        <MdClose />
      </div>
    </div>,
    document.querySelector('#modal')!
  );
};

interface FiltersModalProps {
  close(): void;
  applyFilters(filters: FilterAttrs): void;
  updateInitialValues(filters: FilterAttrs): void;
  initialValues: FilterAttrs;
}

/**
 * A modal to display filter options as a form
 */
export const FiltersModal = (props: FiltersModalProps): React.ReactPortal => {
  return ReactDOM.createPortal(
    <div className="modal" onClick={props.close}>
      <div
        onClick={event => event.stopPropagation()}
        className="modal__container"
      >
        <div className="heading-secondary u-margin-bottom-small u-center-text">
          Filters & Sort
        </div>

        <IoIosClose
          title="Close filters"
          onClick={props.close}
          className="modal__container__close-btn"
        />

        <FiltersForm
          onSubmit={(filters: FilterAttrs) => {
            if (
              window.location.hash === '#/' ||
              window.location.hash.startsWith('#/?')
            )
              props.applyFilters(filters);
            props.close();
          }}
          updateInitialValues={(filters: FilterAttrs) =>
            props.updateInitialValues(filters)
          }
          initialValues={props.initialValues}
        />
      </div>
    </div>,
    document.querySelector('#modal')!
  );
};

/**
 * A modal to display loader
 */
export const Loader = (): React.ReactPortal => {
  return ReactDOM.createPortal(
    <div className="modal">
      <ClipLoader size={50} color={'#ffb7a1'} />
    </div>,
    document.querySelector('#modal')!
  );
};
