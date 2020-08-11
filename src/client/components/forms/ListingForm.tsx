import React, { ChangeEvent } from 'react';
import { Dispatch } from 'redux';
import { connect } from 'react-redux';
import {
  reduxForm,
  Field,
  WrappedFieldProps,
  InjectedFormProps,
  formValueSelector,
  SubmissionError,
} from 'redux-form';
import { MdAddToPhotos } from 'react-icons/md';

import { ListingAttrs, UserDoc } from '../../../server/models';
import {
  ListingImagesParams,
  renderTextInput,
  renderTextarea,
  formFieldValues,
  CombinedLocation,
  SearchedLocation,
  StoreState,
  isSameLocation,
} from '../../utilities';
import { Categories, Subcategories, Conditions, ErrMsg } from '../../../common';
import { LocationInputAutocomplete } from '../LocationInputAutocomplete';
import { searchLocation } from '../../actions';

interface DropdownFieldProps {
  fieldName: string;
  options: string[];
  onChange?: () => void;
}

interface PhotoUploadFieldProps {
  hasExistingImages: boolean;
  hasNewImages: boolean;
}

interface StateProps {
  searchedLocations: SearchedLocation[];
  category: string;
  subcategory: string;
  user: UserDoc;
  locationValue: string;
}

interface DispatchProps {
  searchLocation(term?: string): void;
}
type FormProps = {
  submitBtnText: string;
  formTitle: string;
  sendRequest(
    formValues: ListingAttrs,
    imagesParams: ListingImagesParams
  ): void;
  images?: string[];
} & StateProps &
  DispatchProps;

type ReduxFormProps = InjectedFormProps<ListingAttrs, FormProps> & FormProps;
interface FormState {
  deletedImageIndexes: number[];
  newImages: Record<number, File>;
  newImagesNextIndex: number;
  selectedLocation: CombinedLocation;
}

class Form extends React.Component<ReduxFormProps, FormState> {
  constructor(props: ReduxFormProps) {
    super(props);

    this.state = {
      deletedImageIndexes: [],
      newImages: {},
      newImagesNextIndex: 0,
      selectedLocation: props.initialValues.location!,
    };
  }

  deleteExistingImage = (index: number): void => {
    this.setState(prevState => {
      return {
        deletedImageIndexes: [...prevState.deletedImageIndexes, index],
      };
    });
  };

  deleteNewImage = (index: number): void => {
    // Remove image from the DOM
    const div = document.getElementById(`${index}`);
    div!.parentElement!.removeChild(div!);

    // Remove image from ListingForm local state
    this.setState(prevState => {
      const images = { ...prevState.newImages };
      delete images[index];

      return { newImages: images };
    });
  };

  addNewImage = (file: File): void => {
    this.setState(prevState => {
      return {
        newImages: {
          ...prevState.newImages,
          [prevState.newImagesNextIndex]: file,
        },
        newImagesNextIndex: prevState.newImagesNextIndex + 1,
      };
    });
  };

  renderExistingImages = (): JSX.Element => {
    const { deletedImageIndexes } = this.state;
    const images =
      deletedImageIndexes.length === 0
        ? this.props.initialValues.photos
        : this.props.initialValues.photos!.filter(
            (img, index) => !deletedImageIndexes.includes(index)
          );

    return (
      <>
        {images!.map(filename => {
          return (
            <div key={filename} className="form__listing-photo">
              <img src={`/img/listings/${filename}`} />
            </div>
          );
        })}
      </>
    );
  };

  // Multiple images upload
  renderPhotoUpload: React.StatelessComponent<
    WrappedFieldProps & PhotoUploadFieldProps
  > = ({
    input: { value, ...inputProps },
    meta,
    hasExistingImages,
    hasNewImages,
  }): JSX.Element => {
    const err = meta.error && meta.touched;

    const onChange = (event: ChangeEvent<HTMLInputElement>) => {
      if (!event.target.files) return;

      let reader: FileReader;
      const addPhotosLabel = document.getElementById('form__label--add-photos');

      for (let i = 0; i < event.target.files.length; i++) {
        const index = i + this.state.newImagesNextIndex;

        reader = new FileReader();
        reader.onload = (e: ProgressEvent<FileReader>) => {
          const div = document.createElement('div');
          div.id = `${index}`;
          div.className = 'form__listing-photo';
          div.onclick = () => this.deleteNewImage(index);

          const img = document.createElement('img');
          img.src = `${e.target!.result}`;

          div.appendChild(img);
          addPhotosLabel!.insertAdjacentElement('beforebegin', div);
        };
        reader.readAsDataURL(event.target.files[i]);

        this.addNewImage(event.target.files[i]);
      }
    };

    return (
      <div className="form__group form__listing-photo-upload">
        {hasExistingImages && this.renderExistingImages()}
        <input
          {...inputProps}
          type="file"
          multiple
          id={inputProps.name}
          accept="image/*"
          onChange={onChange}
          className="form__upload"
        />
        <label
          htmlFor={inputProps.name}
          className={`form__label--add-photos ${
            hasExistingImages || hasNewImages
              ? ''
              : 'form__label--add-photos--full-width'
          } ${err ? 'form__label--add-photos--error' : ''}`}
          id="form__label--add-photos"
        >
          <MdAddToPhotos title="Add photos" />
          <span>Add photos</span>
        </label>
        <div className="form__error">{err ? meta.error : null}</div>
      </div>
    );
  };

  // dropdown list
  renderDropdown: React.StatelessComponent<
    WrappedFieldProps & DropdownFieldProps
  > = ({ input, meta, fieldName, options, onChange }): JSX.Element => {
    const err = meta.error && meta.touched;
    const inputClassName = `form__input ${err ? 'form__input--error' : ''}`;

    const change = onChange
      ? () => {
          onChange();
          return input.onChange;
        }
      : input.onChange;

    return (
      <div className="form__group">
        <label htmlFor={fieldName} className="form__label">
          {`${fieldName[0].toUpperCase()}${fieldName.substring(1)}`}
        </label>
        <select
          {...input}
          name={fieldName}
          id={fieldName}
          onChange={change}
          className={inputClassName}
        >
          <option></option>
          {options.map((value, index) => (
            <option value={value} key={index}>
              {value}
            </option>
          ))}
        </select>
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
    formValues: ListingAttrs
  ): ((
    dispatch: Dispatch,
    getState: () => StoreState
  ) => Promise<ListingAttrs>) => (dispatch, getState) => {
    // If the location input value is a string representation of the currently
    // chosen location object (which is store in this class state object),
    // then restore the location value to be that object because we submit an
    // object to the db, not a string.
    if (
      typeof formValues.location === 'string' &&
      isSameLocation(formValues.location, this.state.selectedLocation)
    )
      // @ts-ignore
      formValues.location = this.state.selectedLocation;

    const hasImages =
      Object.keys(this.state.newImages).length > 0 ||
      (this.props.initialValues.photos &&
        this.props.initialValues.photos.length !==
          this.state.deletedImageIndexes.length);
    const isLocationAnObject = typeof formValues.location === 'object';

    if (isLocationAnObject && hasImages) return Promise.resolve(formValues);

    const errors = {
      location: ErrMsg.LocationDropdownListSelection,
      photos: ErrMsg.PhotosRequired,
    };

    if (hasImages) delete errors.photos;
    if (isLocationAnObject) delete errors.location;
    else if (getState!().searchedLocations.length === 0)
      errors.location = ErrMsg.LocationInvalid;

    return Promise.reject(errors);
  };

  onSubmit = (formValues: ListingAttrs, dispatch: Dispatch): void => {
    delete formValues.photos;

    //@ts-ignore
    return dispatch(this.asyncValidatorDispatcher(formValues))
      .then((newValues: ListingAttrs) => {
        newValues.owner = this.props.user.id;

        const { deletedImageIndexes, newImages } = this.state;
        let existingImages = this.props.initialValues.photos;
        let deletedImages: string[] | undefined = undefined;
        if (deletedImageIndexes.length > 0) {
          existingImages = [];
          deletedImages = [];
          this.props.initialValues.photos!.forEach((img, index) => {
            if (deletedImageIndexes.includes(index)) deletedImages!.push(img);
            else existingImages!.push(img);
          });
        }

        this.props.sendRequest(newValues, {
          newImages,
          existingImages,
          deletedImages,
        });
      })
      .catch((err: Record<string, string>) => {
        throw new SubmissionError(err);
      });
  };

  render() {
    const { title, price, description, brand } = formFieldValues;
    const subcategories = this.props.category
      ? (Object.values(Subcategories[this.props.category]) as string[])
      : [];

    return (
      <div className="container__form">
        <div className="u-center-text u-margin-bottom-medium">
          <h2 className="heading-primary">{this.props.formTitle}</h2>
        </div>
        <form onSubmit={this.props.handleSubmit(this.onSubmit)}>
          <input type="submit" disabled style={{ display: 'none' }} />

          <Field
            name="photos"
            component={this.renderPhotoUpload}
            hasExistingImages={
              this.props.initialValues.photos &&
              this.props.initialValues.photos.length !==
                this.state.deletedImageIndexes.length
            }
            hasNewImages={Object.keys(this.state.newImages).length > 0}
          />

          <Field
            name="category"
            component={this.renderDropdown}
            fieldName="category"
            options={Object.values(Categories)}
            onChange={() => this.props.change('subcategory', undefined)}
          />

          <Field
            name="subcategory"
            component={this.renderDropdown}
            fieldName="subcategory"
            options={subcategories}
          />

          <Field component={renderTextInput} {...title} />
          <Field component={renderTextInput} {...price} />

          <Field
            name="condition"
            component={this.renderDropdown}
            fieldName="condition"
            options={Object.values(Conditions)}
          />

          <Field component={renderTextInput} {...brand} />

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
            <Field component={renderTextarea} {...description} />
          </div>

          <button type="submit" className="btn btn--filled">
            {this.props.submitBtnText}
          </button>
        </form>
      </div>
    );
  }
}

const ReduxForm = reduxForm<ListingAttrs, FormProps>({
  form: 'listingForm',
  validate: ({ category, subcategory, title, price, location }) => {
    const errors = {
      category: ErrMsg.CategoryRequired,
      subcategory: ErrMsg.SubcategoryRequired,
      title: ErrMsg.TitleRequired,
      price: ErrMsg.PriceRequired,
      location: ErrMsg.LocationRequired,
    };

    if (category) delete errors.category;
    if (subcategory) delete errors.subcategory;
    if (title) delete errors.title;
    if (price) delete errors.price;
    if (location) delete errors.location;

    return errors;
  },
})(Form);

const selector = formValueSelector('listingForm');

const mapStateToProps = (state: StoreState) => {
  const category = selector(state, 'category');
  const subcategory = selector(state, 'subcategory');
  const locationValue = selector(state, 'location');
  const initialValues = state.listing
    ? state.listing
    : { location: state.user!.location };

  return {
    user: state.user!,
    searchedLocations: state.searchedLocations,
    category,
    subcategory,
    locationValue,
    initialValues,
  };
};

export const ListingForm = connect(mapStateToProps, { searchLocation })(
  //@ts-ignore
  ReduxForm
);
