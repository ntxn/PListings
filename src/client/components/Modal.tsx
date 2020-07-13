import React from 'react';
import ReactDOM from 'react-dom';
import { Link } from 'react-router-dom';
import { BsPersonFill, BsListNested } from 'react-icons/bs';
import { AiFillSetting } from 'react-icons/ai';
import { RiLogoutBoxRLine } from 'react-icons/ri';
import { IoIosArrowForward } from 'react-icons/io';
import { UserDoc } from '../../server/models';

interface ModalProps {
  onDismiss(): void;
  title: string;
  content: string;
  actions: JSX.Element;
}

interface ConfirmationModalProps {
  title: string;
  content: string;
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
        <div className="heading-secondary">{props.title}</div>
        <div className="modal__content u-margin-bottom-small">
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
 * A modal to display menu options for authenticated user: settings, listings, logout
 */
export const UserMenuModal = (props: UserMenuModalProps): JSX.Element => {
  return ReactDOM.createPortal(
    <div className="user-menu" onClick={props.closeUserMenu}>
      <div
        className="user-menu__container"
        onClick={event => event.stopPropagation()}
      >
        <div className="user-menu__option">
          <Link
            to={`/user/${props.user.id}`}
            className="user-menu__option__hover"
            onClick={props.closeUserMenu}
          >
            {props.user.photo ? (
              <img alt="User Avatar" className="user-menu__option__avatar" />
            ) : (
              <BsPersonFill
                title="Default Avatar"
                className="user-menu__option__avatar"
              />
            )}
            <div className="user-menu__brief-info">
              <span className="heading-tertiary">{props.user.name}</span>
              <span className="sub-heading-tertiary">
                {props.user.location.city}
              </span>
            </div>
          </Link>
        </div>
        <hr className="user-menu__divider" />
        <div className="user-menu__option">
          <Link
            to="/user/account-settings"
            className="user-menu__option__hover"
            onClick={props.closeUserMenu}
          >
            <div className="user-menu__option__icon icon">
              <AiFillSetting />
            </div>
            <div className="user-menu__option__content">
              <span className="heading-quaternary">Settings</span>
              <IoIosArrowForward />
            </div>
          </Link>
        </div>
        <div className="user-menu__option">
          <Link
            to="/user/listings"
            className="user-menu__option__hover"
            onClick={props.closeUserMenu}
          >
            <div className="user-menu__option__icon icon">
              <BsListNested />
            </div>
            <div className="user-menu__option__content">
              <span className="heading-quaternary">Listings</span>
              <IoIosArrowForward />
            </div>
          </Link>
        </div>
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
