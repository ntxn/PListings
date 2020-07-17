import React, { useState, ChangeEvent } from 'react';
import { Dispatch } from 'redux';
import { connect } from 'react-redux';
import { BsPersonFill } from 'react-icons/bs';
import {
  Field,
  reduxForm,
  WrappedFieldProps,
  InjectedFormProps,
  formValueSelector,
  SubmissionError,
} from 'redux-form';
import { searchLocation, updateProfile } from '../../actions';
import { ErrMsg } from '../../../common';
import {
  UpdateProfileAttrs as Attrs,
  formFieldValues,
  SearchedLocation,
  StoreState,
  isSameLocation,
  LocationInputFieldProps,
} from '../../utilities';
import { UserDoc } from '../../../server/models';
import {
  renderLocations,
  renderLocationInputField,
  asyncValidatorDispatcher,
} from '../LocationSearchInput';

interface FieldProps {
  label: string;
  type: string;
  placeholder?: string;
  required: boolean;
  disabled?: boolean;
}

interface StateProps {
  user: UserDoc;
  searchedLocations: SearchedLocation[];
  locationValue: string | Geolocation;
}

interface DispatchProps<A> {
  updateProfile(formValues: A): void;
  searchLocation(term?: string): void;
}

type FormProps<A> = StateProps & DispatchProps<A>;

class Form extends React.Component<
  InjectedFormProps<Attrs, FormProps<Attrs>> & FormProps<Attrs>
> {
  state = {
    location: this.props.initialValues.location!,
  };

  typingTimeout: NodeJS.Timeout = setTimeout(() => {}, 10000);

  /**
   * Render text input for simple input like name, email
   */
  renderInput: React.StatelessComponent<WrappedFieldProps & FieldProps> = ({
    input,
    meta,
    ...props
  }): JSX.Element => {
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

  /**
   * Render a textarea for user's about me
   */
  renderTextarea: React.StatelessComponent<WrappedFieldProps & FieldProps> = ({
    input,
    meta,
    ...props
  }): JSX.Element => {
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
  renderPhoto: React.StatelessComponent<WrappedFieldProps & FieldProps> = ({
    input: { value, name, ...inputProps },
    meta,
  }): JSX.Element => {
    const err = meta.error && meta.touched;
    const [photoAdded, setPhotoAdded] = useState(false);
    const imgId = 'form-profile-photo';
    const { photo: initialPhoto, name: userName } = this.props.user;

    /**
     * Handle changes to profile photo image upload.
     */
    const onChange = (event: ChangeEvent<HTMLInputElement>) => {
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
        <label htmlFor={name} className="btn-text btn-text--underlined--orange">
          Choose new photo
        </label>
        <div className="form__error">{err ? meta.error : null}</div>
      </div>
    );
  };

  renderSearchedLocations = (): JSX.Element => {
    const selectLocation = (location: SearchedLocation) => {
      this.props.change('location', location.fields);
      this.props.searchLocation();
      this.setState({ location: location.fields });
    };

    return renderLocations(this.props.searchedLocations, selectLocation);
  };

  /**
   * Handle form submission.
   * Before calling updateProfile, check if the location input value is valid
   */
  onSubmit = (formValues: Attrs, dispatch: Dispatch): void => {
    return (
      //@ts-ignore
      dispatch(asyncValidatorDispatcher(formValues, this.state.location))
        .then((updatedFormValues: Attrs) =>
          this.props.updateProfile(updatedFormValues)
        )
        .catch((err: Record<string, string>) => {
          throw new SubmissionError(err);
        })
    );
  };

  render() {
    const { handleSubmit, invalid, submitting, error, pristine } = this.props;
    const { name, photo, bio } = formFieldValues;
    const email = { ...formFieldValues.email, disabled: true };
    const location: LocationInputFieldProps = {
      ...formFieldValues.location,
      addTimeout: inputOnChange => event => {
        const { value } = event.target; // To avoid `accessing the property `target` on a released/nullified synthetic event`
        clearTimeout(this.typingTimeout);
        this.typingTimeout = setTimeout(
          () => this.props.searchLocation(value),
          150
        );
        inputOnChange(event);
      },
    };

    const isInitialLocation = isSameLocation(
      this.props.locationValue,
      this.props.initialValues.location!
    );

    return (
      <form onSubmit={handleSubmit(this.onSubmit)} className="form">
        <input type="submit" disabled style={{ display: 'none' }} />
        {[name, email].map(field => (
          <Field key={field.name} component={this.renderInput} {...field} />
        ))}
        <Field
          key={location.name}
          component={renderLocationInputField}
          {...location}
        />
        {this.renderSearchedLocations()}
        <Field key={bio.name} component={this.renderTextarea} {...bio} />
        <Field key={photo.name} component={this.renderPhoto} {...photo} />
        <div className="form__error form__error-general">
          {error ? error : null}
        </div>
        <div className="form__btn form__btn--right">
          <button
            type="submit"
            disabled={pristine || invalid || submitting || isInitialLocation}
            className="btn btn--filled"
          >
            Update Profile
          </button>

          <button
            type="button"
            disabled={pristine || submitting || isInitialLocation}
            className="btn btn--outline"
            onClick={this.props.reset}
          >
            Reset
          </button>
        </div>
      </form>
    );
  }
}

const ReduxForm = reduxForm<Attrs, FormProps<Attrs>>({
  form: 'updateProfileForm',
  // enableReinitialize: true,
  validate: ({ name, location }) => {
    const errors = {
      name: ErrMsg.NameRequired,
      location: ErrMsg.LocationRequired,
    };

    if (name) delete errors.name;
    if (location) delete errors.location;

    return errors;
  },
})(Form);

const selector = formValueSelector('updateProfileForm');

const mapStateToProps = (state: StoreState) => {
  const locationValue = selector(state, 'location');
  const { user, searchedLocations } = state;
  const { name, email, location, bio } = user!;
  return {
    searchedLocations,
    user,
    locationValue,
    initialValues: { name, email, location, bio },
  };
};

export const UpdateProfileForm = connect(mapStateToProps, {
  searchLocation,
  updateProfile,
  // @ts-ignore
})(ReduxForm);
