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

import { searchLocation, updateProfile, setBtnLoader } from '../../actions';
import { ErrMsg, GeoLocation } from '../../../common';
import {
  UpdateProfileAttrs as Attrs,
  formFieldValues,
  SearchedLocation,
  StoreState,
  CombinedLocation,
  isSameLocation,
  renderTextInput,
  renderTextarea,
  FieldProps,
  renderBtns,
} from '../../utilities';
import { UserDoc } from '../../../server/models';
import { LocationInputAutocomplete } from '../LocationInputAutocomplete';

interface StateProps {
  user: UserDoc;
  searchedLocations: SearchedLocation[];
  locationValue: string | GeoLocation;
  btnLoading: boolean;
}

interface DispatchProps<A> {
  updateProfile(formValues: A): void;
  searchLocation(term?: string): void;
  setBtnLoader(value: boolean): void;
}

type FormProps<A> = StateProps & DispatchProps<A>;
type ReduxFormProps = InjectedFormProps<Attrs, FormProps<Attrs>> &
  FormProps<Attrs>;

interface FormState {
  selectedLocation: CombinedLocation;
}
class Form extends React.Component<ReduxFormProps, FormState> {
  constructor(props: ReduxFormProps) {
    super(props);
    this.state = {
      selectedLocation: props.initialValues.location!,
    };
  }

  /**
   * Render user's profile photo and a file upload button to change their profile photo
   */
  renderPhoto: React.StatelessComponent<WrappedFieldProps & FieldProps> = ({
    input: { value, ...inputProps },
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
            src={`/img/users/${initialPhoto}`}
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
          id={inputProps.name}
          accept="image/*"
          onChange={onChange}
          className="form__upload"
        />
        <label
          htmlFor={inputProps.name}
          className="btn-text btn-text--underlined--orange"
        >
          Choose new photo
        </label>
        <div className="form__error">{err ? meta.error : null}</div>
      </div>
    );
  };

  /**
   * An async validator to check if the location input is valid.
   * Location input validator has to be asynchorous because we don't
   * query for locations on every keystroke, but waiting for the
   * user to stop typing before running a query.
   */
  asyncValidatorDispatcher = (
    formValues: Attrs
  ): ((dispatch: Dispatch, getState: () => StoreState) => Promise<Attrs>) => (
    dispatch,
    getState
  ) => {
    // If the location input value is a string representation of the currently
    // chosen location object (which is store in this class state object),
    // then restore the location value to be that object because we submit an
    // object to the db, not a string.
    if (
      typeof formValues.location === 'string' &&
      isSameLocation(formValues.location, this.state.selectedLocation)
    )
      formValues.location = this.state.selectedLocation;

    if (typeof formValues.location === 'object')
      return Promise.resolve(formValues);

    const error = { location: ErrMsg.LocationDropdownListSelection };

    if (getState!().searchedLocations.length === 0)
      error.location = ErrMsg.LocationInvalid;

    return Promise.reject(error);
  };

  /**
   * Handle form submission.
   * Before calling updateProfile, check if the location input value is valid
   */
  onSubmit = (formValues: Attrs, dispatch: Dispatch): void => {
    this.props.setBtnLoader(true);

    return (
      //@ts-ignore
      dispatch(this.asyncValidatorDispatcher(formValues))
        .then((newValues: Attrs) => this.props.updateProfile(newValues))
        .catch((err: Record<string, string>) => {
          throw new SubmissionError(err);
        })
        .finally(() => this.props.setBtnLoader(false))
    );
  };

  resetForm = (): void => {
    this.props.reset();
    this.props.searchLocation();
  };

  render() {
    const { handleSubmit, error } = this.props;
    const { name, email, photo, bio } = formFieldValues;

    return (
      <form onSubmit={handleSubmit(this.onSubmit)}>
        <input type="submit" disabled style={{ display: 'none' }} />

        {[name, email].map(field => (
          <Field key={field.name} component={renderTextInput} {...field} />
        ))}

        <LocationInputAutocomplete
          change={this.props.change}
          selectedLocation={this.state.selectedLocation}
          updateSelectedLocation={(selectedLocation: CombinedLocation) =>
            this.setState({ selectedLocation })
          }
          currentLocationInputValue={this.props.locationValue}
          searchLocation={this.props.searchLocation}
          searchedLocations={this.props.searchedLocations}
        />

        <div className="u-margin-top-2rem">
          <Field key={bio.name} component={renderTextarea} {...bio} />
        </div>

        <Field key={photo.name} component={this.renderPhoto} {...photo} />

        <div className="form__error form__error-general">
          {error ? error : null}
        </div>

        {renderBtns(this.props, 'Update Profile', this.state.selectedLocation)}
      </form>
    );
  }
}

const ReduxForm = reduxForm<Attrs, FormProps<Attrs>>({
  form: 'updateProfileForm',
  enableReinitialize: true,
  validate: ({ name, email, location }) => {
    const errors = {
      name: ErrMsg.NameRequired,
      location: ErrMsg.LocationRequired,
      email: ErrMsg.EmailRequired,
    };

    if (name) delete errors.name;
    if (email) delete errors.email;
    if (location) delete errors.location;

    return errors;
  },
})(Form);

const selector = formValueSelector('updateProfileForm');

const mapStateToProps = (state: StoreState) => {
  const locationValue = selector(state, 'location');
  const { user, searchedLocations, btnLoading } = state;
  const { name, email, location, bio } = user!;
  return {
    searchedLocations,
    user,
    locationValue,
    btnLoading,
    initialValues: { name, email, location, bio },
  };
};

export const UpdateProfileForm = connect(mapStateToProps, {
  searchLocation,
  updateProfile,
  setBtnLoader,
  // @ts-ignore
})(ReduxForm);
