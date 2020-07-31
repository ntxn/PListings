import React, { ChangeEvent } from 'react';
import PulseLoader from 'react-spinners/PulseLoader';
import { EventOrValueHandler, Field, WrappedFieldProps } from 'redux-form';

import { BaseLocation } from '../../common';
import { SearchedLocation, CombinedLocation } from './interfaces';

/**
 * Create a string representation of a location object
 * @param location Location object that has 3 fields: city, state, zip
 */
export const getLocationStr = (location: BaseLocation): string =>
  `${location.city}, ${location.state} ${location.zip}`;

/**
 * Compares if value is the string representation of the location object
 */
export const isSameLocation = (
  value: string,
  location: BaseLocation
): boolean => value === getLocationStr(location);

interface Props {
  searchedLocations: SearchedLocation[];
  searchLocation(term?: string): void;
  currentLocationInputValue: CombinedLocation | string;
  change(field: string, value: any): void;
  selectedLocation: CombinedLocation;
  updateSelectedLocation(value: CombinedLocation): void;
}

interface State {
  activeOption: number;
  invalidSearchTerm: boolean;
  locationLoading: boolean;
}

/**
 * An Autocomplete component for searching for a location
 */
export class LocationInputAutocomplete extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      activeOption: 0,
      invalidSearchTerm: false,
      locationLoading: false,
    };
  }

  typingTimeout = setTimeout(() => {}, 10000);
  loadingTimeout = setTimeout(() => {}, 10000);

  /**
   * Store the provided location as the currently selected location for location input
   */
  selectLocation = (location: SearchedLocation): void => {
    this.props.change('location', location.fields);
    this.props.searchLocation(); // reset search result to []
    this.props.updateSelectedLocation(location.fields);
  };

  /**
   * Function controls what happens when user press enter, up or down key while location input is focused
   */
  inputOnKeyDown = (event: React.KeyboardEvent<HTMLInputElement>): void => {
    const { searchedLocations } = this.props;
    if (searchedLocations.length === 0) return;

    if (event.keyCode === 13) {
      this.selectLocation(searchedLocations[this.state.activeOption]);
      this.setState({ activeOption: 0 });
    } else if (event.keyCode === 38) {
      if (this.state.activeOption === 0) return;
      this.setState(prevState => {
        return { activeOption: prevState.activeOption - 1 };
      });
    } else if (event.keyCode === 40) {
      if (this.state.activeOption + 1 === searchedLocations.length) return;
      this.setState(prevState => {
        return { activeOption: prevState.activeOption + 1 };
      });
    }
  };

  /**
   * Validate if the current search term is valid (ie have at least 1 result)
   */
  validateSearchTerm = (): void => {
    const { currentLocationInputValue: value, searchedLocations } = this.props;

    if (
      typeof value === 'string' &&
      !isSameLocation(value, this.props.selectedLocation) &&
      searchedLocations.length === 0
    )
      this.setState({ invalidSearchTerm: true });
    else this.setState({ invalidSearchTerm: false });
  };

  /**
   * Render the list of locations found from the search result
   */
  renderLocationList = (): JSX.Element => {
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
            {getLocationStr(location.fields)}
          </li>
        ))}
      </ul>
    );
  };

  /***
   * render a text input field with autocomplete when user enters addresses
   */
  renderLocation: React.FunctionComponent<
    WrappedFieldProps & { extraClassname: string }
  > = ({
    input: { value, onChange: inputOnChange, name, ...inputProps },
    meta,
    extraClassname,
  }): JSX.Element => {
    const err = meta.error && meta.touched;

    const onChange = (inputOnChange: EventOrValueHandler<ChangeEvent>) => (
      event: ChangeEvent<HTMLInputElement>
    ) => {
      this.props.searchLocation();
      clearTimeout(this.typingTimeout);
      clearTimeout(this.loadingTimeout);

      const { value: userInput } = event.target;
      if (userInput) {
        this.loadingTimeout = setTimeout(
          () => this.setState({ locationLoading: true }),
          200
        );
        this.typingTimeout = setTimeout(async () => {
          await this.props.searchLocation(userInput);
          this.setState({ locationLoading: false });
          this.validateSearchTerm();
        }, 500);
      }
      inputOnChange(event);
    };

    return (
      <>
        <label className="form__label" htmlFor={name}>
          Location
        </label>
        <input
          {...inputProps}
          name={name}
          id={name}
          type="text"
          required={true}
          placeholder="Enter city or zip code"
          autoComplete="off"
          onChange={onChange(inputOnChange)}
          value={typeof value === 'object' ? getLocationStr(value) : value}
          onKeyDown={this.inputOnKeyDown}
          className={`form__input ${
            err ? 'form__input--error' : ''
          } ${extraClassname}`}
        />
        <div className="form__error">{err ? meta.error : null}</div>
      </>
    );
  };

  render(): JSX.Element {
    const extraClassname = this.state.invalidSearchTerm
      ? 'form__input--error'
      : '';
    return (
      <div className="location">
        <Field
          component={this.renderLocation}
          name="location"
          extraClassname={extraClassname}
        />
        <div className="location__loader">
          <PulseLoader
            size={5}
            margin={2}
            color={'#7ed56f'}
            loading={this.state.locationLoading}
          />
        </div>
        {this.renderLocationList()}
      </div>
    );
  }
}
