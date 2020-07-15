import React from 'react';
import { connect } from 'react-redux';
import { FiMenu } from 'react-icons/fi';
import { MdPersonPin, MdNotifications } from 'react-icons/md';
import { RiLockPasswordLine } from 'react-icons/ri';
import {
  StoreState,
  UpdatePasswordAttrs,
  formFieldValues,
} from '../../utilities';
import { UserDoc } from '../../../server/models';
import { AuthRequired } from '../AuthRequired';
import { UpdatePasswordForm, UpdateProfileForm } from '../forms';
import { updatePassword } from '../../actions';

interface StateProps {
  user: UserDoc | null;
}

interface DispatchProps {
  updatePassword(formValue: UpdatePasswordAttrs): void;
}

type AccountSettingsProps = StateProps & DispatchProps;

enum FormIds {
  profile = 'update-profile-form',
  password = 'update-password-form',
}

const _AccountSettings = (props: AccountSettingsProps): JSX.Element => {
  const dropdownOptions = {
    [FormIds.profile]: 0,
    [FormIds.password]: 1,
  };

  const renderUpdatePasswordForm = (): JSX.Element => {
    const onSubmit = (formValues: UpdatePasswordAttrs) =>
      props.updatePassword(formValues);
    const { currentPassword, password, passwordConfirm } = formFieldValues;
    const formFields = [currentPassword, password, passwordConfirm];

    return (
      <div className="container__form u-hide" id={FormIds.password}>
        <h2 className="heading-primary u-margin-bottom-xxsmall">
          Change password
        </h2>
        <hr className="u-divider u-margin-bottom-medium" />
        <UpdatePasswordForm
          onSubmit={onSubmit}
          formFields={formFields}
          submitBtnText="Update Password"
        />
      </div>
    );
  };

  const renderUpdateProfileForm = () => {
    return (
      <div className="container__form" id={FormIds.profile}>
        <h2 className="heading-primary u-margin-bottom-xxsmall">
          Public profile
        </h2>
        <hr className="u-divider u-margin-bottom-medium" />
        <UpdateProfileForm />
      </div>
    );
  };

  const showForm = (formId: FormIds): void => {
    const forms = document.querySelector('.settings__content')!.children;
    const options = document.querySelector('.settings__dropdown__content')!
      .children;

    for (let i = 0; i < forms.length; i++) {
      forms[i].classList.add('u-hide');
      options[i].classList.remove('settings__dropdown__option__active');
    }

    const activeForm = document.getElementById(formId);
    activeForm!.classList.remove('u-hide');
    options[dropdownOptions[formId]].classList.add(
      'settings__dropdown__option__active'
    );
  };

  const renderSettings = (): JSX.Element => {
    return (
      <div className="settings">
        <div className="settings__dropdown">
          <FiMenu className="settings__dropdown__btn" />
          <div className="settings__dropdown__content">
            <div
              className="settings__dropdown__option settings__dropdown__option__active"
              onClick={() => showForm(FormIds.profile)}
            >
              <MdPersonPin />
              <span>Profile</span>
            </div>
            <div
              className="settings__dropdown__option"
              onClick={() => showForm(FormIds.password)}
            >
              <RiLockPasswordLine />
              <span>Password</span>
            </div>
            <div className="settings__dropdown__option">
              <MdNotifications />
              <span>Notifications</span>
            </div>
          </div>
        </div>
        <div className="settings__content">
          {renderUpdateProfileForm()}
          {renderUpdatePasswordForm()}
        </div>
      </div>
    );
  };

  return (
    <>
      {props.user ? (
        renderSettings()
      ) : (
        <AuthRequired route="Account Settings" />
      )}
    </>
  );
};

const mapStateToProps = (state: StoreState): StateProps => {
  return { user: state.user };
};

export const AccountSettings = connect(mapStateToProps, {
  updatePassword,
})(_AccountSettings);
