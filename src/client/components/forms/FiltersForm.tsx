import React from 'react';
import { Dispatch } from 'redux';
import { connect } from 'react-redux';
import {
  reduxForm,
  Field,
  InjectedFormProps,
  formValueSelector,
  SubmissionError,
} from 'redux-form';

import {
  renderTextInput,
  renderDropdown,
  CombinedLocation,
  SearchedLocation,
  StoreState,
  renderBtns,
  asyncValidatorDispatcher,
  FilterAttrs,
  formFieldValues,
} from '../../utilities';
import {
  Categories,
  Subcategories,
  ErrMsg,
  SortBy,
  PostedWithin,
} from '../../../common';
import { LocationInputAutocomplete } from '../LocationInputAutocomplete';
import { searchLocation, setBtnLoader } from '../../actions';

interface StateProps {
  searchedLocations: SearchedLocation[];
  category: string;
  subcategory: string;
  locationValue: string;
  btnLoading: boolean;
  defaultFilters: FilterAttrs;
}

interface DispatchProps {
  searchLocation(term?: string): void;
  setBtnLoader(value: boolean): void;
}

type FormProps = {
  onSubmit(filters: FilterAttrs): void;
  updateInitialValues(filters: FilterAttrs): void;
} & StateProps &
  DispatchProps;

type ReduxFormProps = InjectedFormProps<FilterAttrs, FormProps> & FormProps;
interface FormState {
  selectedLocation: CombinedLocation;
}

class Form extends React.Component<ReduxFormProps, FormState> {
  constructor(props: ReduxFormProps) {
    super(props);

    this.state = { selectedLocation: props.initialValues.location! };
  }

  onSubmit = (formValues: FilterAttrs, dispatch: Dispatch): void => {
    this.props.setBtnLoader(true);

    return dispatch(
      //@ts-ignore
      asyncValidatorDispatcher(formValues, this.state.selectedLocation)
    )
      .then((newValues: FilterAttrs) => {
        this.props.updateInitialValues({ ...newValues });
        this.props.onSubmit(newValues);
      })
      .catch((err: Record<string, string>) => {
        throw new SubmissionError(err);
      })
      .finally(() => this.props.setBtnLoader(false));
  };

  render() {
    const { minPrice, maxPrice, distance } = formFieldValues;
    const subcategories = this.props.category
      ? (Object.values(Subcategories[this.props.category]) as string[])
      : [];
    const { error } = this.props;

    return (
      <div className="container__form">
        <form onSubmit={this.props.handleSubmit(this.onSubmit)}>
          <input type="submit" disabled style={{ display: 'none' }} />

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
            <Field component={renderTextInput} {...distance} />
          </div>

          <Field
            name="category"
            component={renderDropdown}
            fieldName="category"
            options={Object.values(Categories)}
            onChange={() => this.props.change('subcategory', undefined)}
            emptyOptionAllowed={true}
          />

          <Field
            name="subcategory"
            component={renderDropdown}
            fieldName="subcategory"
            options={subcategories}
            emptyOptionAllowed={true}
          />

          <Field component={renderTextInput} {...minPrice} />
          <Field component={renderTextInput} {...maxPrice} />

          <Field
            name="postedWithin"
            component={renderDropdown}
            fieldName="postedWithin"
            options={Object.values(PostedWithin)}
          />

          <Field
            name="sort"
            component={renderDropdown}
            fieldName="sort"
            options={Object.values(SortBy)}
          />

          <div className="form__error form__error-general">
            {error ? error : null}
          </div>

          {renderBtns(this.props, 'Apply', this.state.selectedLocation, () => {
            //@ts-ignore
            this.props.initialize(this.props.defaultFilters, true); // keepDirty to true
          })}
        </form>
      </div>
    );
  }
}

const ReduxForm = reduxForm<FilterAttrs, FormProps>({
  form: 'filtersForm',
  validate: ({ location }) => {
    const errors = {
      location: ErrMsg.LocationRequired,
    };

    if (location) delete errors.location;

    return errors;
  },
})(Form);

const selector = formValueSelector('filtersForm');

const mapStateToProps = (state: StoreState) => {
  const category = selector(state, 'category');
  const subcategory = selector(state, 'subcategory');
  const locationValue = selector(state, 'location');

  return {
    searchedLocations: state.searchedLocations,
    defaultFilters: state.defaultFilters,
    btnLoading: state.btnLoading,
    category,
    subcategory,
    locationValue,
  };
};

export const FiltersForm = connect(mapStateToProps, {
  searchLocation,
  setBtnLoader,
})(
  //@ts-ignore
  ReduxForm
);
