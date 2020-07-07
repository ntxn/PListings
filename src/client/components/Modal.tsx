import React from 'react';
import ReactDOM from 'react-dom';

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
  action: () => void;
  setModalSwitch: (status: boolean) => void;
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
  const closeModal = () => props.setModalSwitch(false);

  const logout = () => {
    props.setModalSwitch(false);
    props.action();
  };

  const renderActions = (): JSX.Element => {
    return (
      <>
        <button className="btn btn--filled" onClick={closeModal}>
          Cancel
        </button>
        <button className="btn btn--outline u-white-bg" onClick={logout}>
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
      onDismiss={closeModal}
    />
  );
};
