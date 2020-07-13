import React from 'react';
import { connect } from 'react-redux';
import { FiMenu } from 'react-icons/fi';
import { MdPersonPin, MdNotifications } from 'react-icons/md';
import { RiLockPasswordLine } from 'react-icons/ri';
import {
  StoreState,
  UpdatePasswordAttrs,
  formFieldValues,
  UpdateProfileAttrs,
} from '../../utilities';
import { UserDoc } from '../../../server/models';
import { AuthRequired } from '../AuthRequired';
import { UpdatePasswordForm, UpdateProfileForm } from '../forms';
import { updatePassword, updateProfile } from '../../actions';

interface StateProps {
  user: UserDoc | null;
}

interface DispatchProps {
  updatePassword(formValue: UpdatePasswordAttrs): void;
  updateProfile(formValue: UpdateProfileAttrs): void;
}

type AccountSettingsProps = StateProps & DispatchProps;

const _AccountSettings = (props: AccountSettingsProps): JSX.Element => {
  const renderUpdatePasswordForm = (): JSX.Element => {
    const onSubmit = (formValues: UpdatePasswordAttrs) =>
      props.updatePassword(formValues);
    const { currentPassword, password, passwordConfirm } = formFieldValues;
    const formFields = [currentPassword, password, passwordConfirm];

    return (
      <div className="container__form">
        <UpdatePasswordForm onSubmit={onSubmit} formFields={formFields} />
      </div>
    );
  };

  const renderUpdateProfileForm = () => {
    const onSubmit = (formValues: UpdateProfileAttrs) =>
      props.updateProfile(formValues);

    const { name, email, location, photo, bio } = props.user!;
    const initialValues = {
      name,
      email,
      location: `${location.city}`,
      bio,
    };

    return (
      <div className="container__form">
        <UpdateProfileForm
          onSubmit={onSubmit}
          initialValues={initialValues}
          photo={photo}
          userName={name}
        />
      </div>
    );
  };

  const renderSettings = (): JSX.Element => {
    return (
      <div className="settings">
        <div className="settings__dropdown">
          <FiMenu className="settings__dropdown__btn" />
          <div className="settings__dropdown__content">
            <div className="settings__dropdown__option">
              <MdPersonPin className="settings__dropdown__option__icon" />
              <span className="settings__dropdown__option__title">Profile</span>
            </div>
            <div className="settings__dropdown__option">
              <RiLockPasswordLine className="settings__dropdown__option__icon" />
              <span className="settings__dropdown__option__title">
                Password
              </span>
            </div>
            <div className="settings__dropdown__option">
              <MdNotifications className="settings__dropdown__option__icon" />
              <span className="settings__dropdown__option__title">
                Notifications
              </span>
            </div>
          </div>
        </div>
        <div className="settings__content">
          {renderUpdatePasswordForm()}
          {renderUpdateProfileForm()}
        </div>
      </div>
    );
  };

  return (
    <div>
      {props.user ? (
        renderSettings()
      ) : (
        <AuthRequired route="Account Settings" />
      )}
    </div>
  );
};

const mapStateToProps = (state: StoreState): StateProps => {
  return { user: state.user };
};

export const AccountSettings = connect(mapStateToProps, {
  updatePassword,
  updateProfile,
})(_AccountSettings);
