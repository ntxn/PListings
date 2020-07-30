import React, { useState, ChangeEvent } from 'react';
import { Dispatch } from 'redux';
import { connect } from 'react-redux';
import { BsPersonFill } from 'react-icons/bs';
import {
  Field,
  reduxForm,
  WrappedFieldProps,
  InjectedFormProps,
  EventOrValueHandler,
  formValueSelector,
  SubmissionError,
} from 'redux-form';
import PulseLoader from 'react-spinners/PulseLoader';

import { searchLocation, updateProfile, setBtnLoader } from '../../actions';
import { ErrMsg, BaseLocation } from '../../../common';
import {
  UpdateProfileAttrs as Attrs,
  formFieldValues,
  SearchedLocation,
  StoreState,
  CombinedLocation,
} from '../../utilities';
import { UserDoc } from '../../../server/models';
import { BtnLoader } from '../Loader';

interface FieldProps {
  label: string;
  type: string;
  placeholder?: string;
  required: boolean;
  inputClassName: string;
}

interface StateProps {
  user: UserDoc;
  searchedLocations: SearchedLocation[];
  locationValue: string | Geolocation;
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
  location: CombinedLocation;
  activeOption: number;
  invalidSearchTerm: boolean;
  locationLoading: boolean;
}

class Form extends React.Component<ReduxFormProps, FormState> {
  constructor(props: ReduxFormProps) {
    super(props);
    this.state = {
      location: this.props.initialValues.location!,
      activeOption: 0,
      invalidSearchTerm: false,
      locationLoading: false,
    };
  }

  typingTimeout: NodeJS.Timeout = setTimeout(() => {}, 10000);
  locationLoadingTimeout: NodeJS.Timeout = setTimeout(() => {}, 10000);

  isSameLocation = (value: string, location: BaseLocation): boolean =>
    value === this.getLocationStr(location);

  getLocationStr = (location: BaseLocation): string =>
    `${location.city}, ${location.state} ${location.zip}`;

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
      <div className="form__group u-margin-top-2rem">
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

  selectLocation = (location: SearchedLocation) => {
    this.props.change('location', location.fields);
    this.props.searchLocation();
    this.setState({ location: location.fields });
  };

  inputOnKeyDown = (event: React.KeyboardEvent<HTMLInputElement>): void => {
    const { activeOption } = this.state;
    const { searchedLocations } = this.props;
    if (searchedLocations.length === 0) return;

    if (event.keyCode === 13) {
      this.selectLocation(searchedLocations[activeOption]);
      this.setState({ activeOption: 0 });
    } else if (event.keyCode === 38) {
      if (activeOption === 0) return;
      this.setState(prevState => {
        return { activeOption: prevState.activeOption - 1 };
      });
    } else if (event.keyCode === 40) {
      if (activeOption + 1 === searchedLocations.length) return;
      this.setState(prevState => {
        return { activeOption: prevState.activeOption + 1 };
      });
    }
  };

  isInvalidSearchTerm = () => {
    const { locationValue: value, searchedLocations } = this.props;
    const { location } = this.state;
    if (
      typeof value === 'string' &&
      !this.isSameLocation(value, location) &&
      searchedLocations.length === 0
    )
      this.setState({ invalidSearchTerm: true });
    else this.setState({ invalidSearchTerm: false });
  };

  renderSearchedLocations = (): JSX.Element => {
    return (
      <ul
        className={
          this.props.searchedLocations.length > 0
            ? 'location__list u-margin-top-xxsmall'
            : ''
        }
      >
        {this.props.searchedLocations.map((location, index) => (
          <li
            key={location.recordid}
            onClick={() => this.selectLocation(location)}
            className={`location__list__item ${
              this.state.activeOption === index
                ? 'location__list__item--active'
                : ''
            }`}
          >
            {this.getLocationStr(location.fields)}
          </li>
        ))}
      </ul>
    );
  };

  /***
   * render a text input field with autocomplete when user enters addresses
   */
  renderLocation: React.StatelessComponent<WrappedFieldProps & FieldProps> = ({
    input: { value, name, onChange: inputOnChange, ...inputProps },
    meta,
    inputClassName,
    ...props
  }): JSX.Element => {
    const err = meta.error && meta.touched;

    const onChange = (inputOnChange: EventOrValueHandler<ChangeEvent>) => (
      event: ChangeEvent<HTMLInputElement>
    ) => {
      this.props.searchLocation();
      clearTimeout(this.typingTimeout);
      clearTimeout(this.locationLoadingTimeout);

      const { value: userInput } = event.target;
      if (userInput) {
        this.locationLoadingTimeout = setTimeout(
          () => this.setState({ locationLoading: true }),
          200
        );
        this.typingTimeout = setTimeout(async () => {
          await this.props.searchLocation(userInput);
          this.setState({ locationLoading: false });
          this.isInvalidSearchTerm();
        }, 500);
      }
      inputOnChange(event);
    };

    return (
      <>
        <label className="form__label" htmlFor={name}>
          {props.label}
        </label>
        <input
          {...inputProps}
          {...props}
          autoComplete="off"
          placeholder="Enter city or zip code"
          className={`${err ? 'form__input--error' : ''} ${inputClassName}`}
          id={name}
          onChange={onChange(inputOnChange)}
          value={typeof value === 'object' ? this.getLocationStr(value) : value}
          onKeyDown={this.inputOnKeyDown}
        />
        <div className="form__error">{err ? meta.error : null}</div>
      </>
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
      this.isSameLocation(formValues.location, this.state.location)
    )
      formValues.location = this.state.location;

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
    const { handleSubmit, invalid, submitting, error, pristine } = this.props;
    const { name, email, location, photo, bio } = formFieldValues;
    const isInitialLocation =
      typeof this.props.locationValue === 'string' &&
      this.isSameLocation(
        this.props.locationValue,
        this.props.initialValues.location!
      );

    const validLocation =
      typeof this.props.locationValue === 'object' ||
      this.isSameLocation(this.props.locationValue, this.state.location);

    const locationInputClassName = `form__input ${
      this.state.invalidSearchTerm ? 'form__input--error' : ''
    } ${this.props.searchedLocations.length > 0 ? 'location__input' : ''}`;

    return (
      <form onSubmit={handleSubmit(this.onSubmit)} className="form">
        <input type="submit" disabled style={{ display: 'none' }} />
        {[name, email].map(field => (
          <Field key={field.name} component={this.renderInput} {...field} />
        ))}
        <div className="location">
          <Field
            key={location.name}
            component={this.renderLocation}
            {...location}
            inputClassName={locationInputClassName}
          />
          <div className="location__loader">
            <PulseLoader
              size={5}
              margin={2}
              color={'#7ed56f'}
              loading={this.state.locationLoading}
            />
          </div>
          {this.renderSearchedLocations()}
        </div>
        <Field key={bio.name} component={this.renderTextarea} {...bio} />
        <Field key={photo.name} component={this.renderPhoto} {...photo} />
        <div className="form__error form__error-general">
          {error ? error : null}
        </div>
        <div className="form__btn form__btn--right">
          <button
            type="button"
            disabled={pristine || submitting || isInitialLocation}
            className="btn btn--outline"
            onClick={this.resetForm}
          >
            Reset
          </button>

          {this.props.btnLoading ? (
            <BtnLoader />
          ) : (
            <button
              type="submit"
              disabled={
                pristine ||
                invalid ||
                submitting ||
                isInitialLocation ||
                !validLocation
              }
              className="btn btn--filled"
            >
              Update Profile
            </button>
          )}
        </div>
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
