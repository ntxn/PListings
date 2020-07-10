import React, { useState } from 'react';
import { BsPersonFill } from 'react-icons/bs';

import {
  Field,
  reduxForm,
  WrappedFieldProps,
  InjectedFormProps,
} from 'redux-form';
import { ErrMsg } from '../../../common';
import {
  UpdateProfileAttrs as Attrs,
  formFieldValues,
  EventWithTarget,
} from '../../utilities';

interface CustomFormProps {
  label: string;
  type: string;
  placeholder?: string;
  required: boolean;
  disabled?: boolean;
  initialPhoto?: string;
  userName: string;
}

interface FormProps<Attrs> {
  onSubmit(formValues: Attrs): void;
  photo?: string;
  userName: string;
}

class Form extends React.Component<
  InjectedFormProps<Attrs, FormProps<Attrs>> & FormProps<Attrs>
> {
  renderInput: React.StatelessComponent<
    WrappedFieldProps & CustomFormProps
  > = ({ input, meta, ...props }): JSX.Element => {
    const err = meta.error && meta.touched;
    const inputClassName = `form__input ${err ? 'form__input--error' : ''}`;
    return (
      <div className="form__group">
        <label className="form__label" htmlFor={input.name}>
          {props.label}
        </label>
        <input
          className={inputClassName}
          id={input.name}
          {...input}
          {...props}
        />
        <div className="form__error">{err ? meta.error : null}</div>
      </div>
    );
  };

  renderTextarea: React.StatelessComponent<
    WrappedFieldProps & CustomFormProps
  > = ({ input, meta, ...props }): JSX.Element => {
    const err = meta.error && meta.touched;
    const inputClassName = `form__input ${err ? 'form__input--error' : ''}`;
    const maxChars = 150;

    return (
      <div className="form__group">
        <label className="form__label" htmlFor={input.name}>
          {props.label}
        </label>
        <textarea
          {...input}
          maxLength={maxChars}
          className={inputClassName}
          id={input.name}
          placeholder={props.placeholder}
        />
        <div className="form__length">{`${input.value.length} / ${maxChars}`}</div>
        <div className="form__error">{err ? meta.error : null}</div>
      </div>
    );
  };

  /**
   * Render user's profile photo and a file upload button to change their profile photo
   */
  renderPhoto: React.StatelessComponent<
    WrappedFieldProps & CustomFormProps
  > = ({
    input: { value, name, ...inputProps },
    meta,
    initialPhoto,
    userName,
  }): JSX.Element => {
    const err = meta.error && meta.touched;
    const [photoAdded, setPhotoAdded] = useState(false);
    const imgId = 'form-profile-photo';
    /**
     * Handle changes to profile photo image upload.
     */
    const onChange = (event: EventWithTarget) => {
      const reader = new FileReader();
      const img = document.getElementById(imgId);
      if (!event.target.files) return;

      // User clicks to add a photo but then cancel so no file was selected
      // => Remove previous chosen photo from display
      if (!event.target.files[0]) {
        setPhotoAdded(false);

        if (initialPhoto) img!.setAttribute('src', initialPhoto!);
        else img!.parentNode!.removeChild(img!);
        return;
      }

      // User added a photo, display photo on screen
      setPhotoAdded(true);
      reader.onload = (e: ProgressEvent<FileReader>) => {
        img!.setAttribute('src', e.target!.result as string);
      };
      reader.readAsDataURL(event.target.files[0]);
    };

    const displayImage = initialPhoto || photoAdded;
    return (
      <div className="form__group form__photo-upload">
        <div className="form__user-photo">
          <img
            id={imgId}
            src={initialPhoto}
            alt={`${userName} photo`}
            className={displayImage ? '' : 'u-hide'}
          />
          <BsPersonFill
            title="Default Avatar"
            className={displayImage ? 'u-hide' : ''}
          />
        </div>
        <input
          {...inputProps}
          type="file"
          id={name}
          accept="image/*"
          onChange={onChange}
          className="form__upload"
        />
        <label
          htmlFor={name}
          className="btn-text btn-text--orange u-margin-top-xxsmall"
        >
          Choose new photo
        </label>
        <div className="form__error">{err ? meta.error : null}</div>
      </div>
    );
  };

  onSubmit = (formValues: Attrs): void => this.props.onSubmit(formValues);

  render() {
    const { handleSubmit, invalid, submitting, error, pristine } = this.props;
    const { name, email, location, photo, bio } = formFieldValues;
    const disabledEmail = { ...email, disabled: true };

    return (
      <form onSubmit={handleSubmit(this.onSubmit)} className="form">
        <Field
          key={photo.name}
          component={this.renderPhoto}
          {...photo}
          initialPhoto={this.props.photo}
          userName={this.props.userName}
        />
        {[name, disabledEmail].map(field => (
          <Field key={field.name} component={this.renderInput} {...field} />
        ))}
        {/* <Field key={location.name} component={this.renderLocation} /> */}
        <Field key={bio.name} component={this.renderTextarea} {...bio} />
        <div className="form__error form__error-general">
          {error ? error : null}
        </div>
        <div className="form__btn">
          <button
            type="submit"
            disabled={pristine || invalid || submitting}
            className="btn btn--filled"
          >
            Submit
          </button>
        </div>
      </form>
    );
  }
}

export const UpdateProfileForm = reduxForm<Attrs, FormProps<Attrs>>({
  form: 'updateProfileForm',
  // enableReinitialize: true,
  validate: ({ name, location }: Attrs) => {
    const errors = {
      name: ErrMsg.NameRequired,
      location: ErrMsg.LocationCityRequired,
    };

    if (name) delete errors.name;
    if (location) delete errors.location;

    return errors;
  },
})(Form);
