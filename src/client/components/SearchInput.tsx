import React, { useState } from 'react';
import { connect } from 'react-redux';
import { FiSearch } from 'react-icons/fi';
import { IoIosOptions } from 'react-icons/io';

import { FiltersModal } from './Modal';
import { history } from '../history';
import { FilterAttrs, StoreState } from '../utilities';
import { UserDoc } from '../../server/models';
import { GeoLocation, SortBy, PostedWithin } from '../../common';

interface SearchInputProps {
  user: UserDoc | undefined;
  currentLocation: GeoLocation;
}

const _SearchInput = (props: SearchInputProps): JSX.Element => {
  const DEFAULT_FILTERS: Partial<FilterAttrs> = {
    sort: SortBy.NewestFirst,
    postedWithin: PostedWithin.AllListings,
    distance: 20,
    location: props.user ? props.user.location : props.currentLocation,
  };

  const [initialValues, setInitialValues] = useState(DEFAULT_FILTERS);
  const [showFilters, setShowFilters] = useState(false);

  const currentUrlParams = new URLSearchParams(window.location.search);

  const renderFilterOptions = (): JSX.Element => {
    return <div>jhj</div>;
  };

  return (
    <div className="search-input">
      <div
        className="search-input__search"
        onKeyPress={() => console.log('Search')}
      >
        <input
          type="text"
          className="search-input__search--input"
          placeholder="Search plistings"
        />
        <FiSearch
          title="Click to search"
          onClick={() => console.log(window.location)}
          className="search-input__search--btn"
        />
      </div>
      <IoIosOptions
        title="Filter options"
        onClick={() => {
          setShowFilters(true);
          const header = document.querySelector(
            '.container__center-content-horizontally'
          );

          header!.classList.add('u-z-index-0');
        }}
        className="search-input__filters"
      />
      {showFilters && (
        <FiltersModal
          close={() => {
            setShowFilters(false);
            const header = document.querySelector(
              '.container__center-content-horizontally'
            );

            header!.classList.remove('u-z-index-0');
          }}
          applyFilters={(filters: FilterAttrs) => {
            //TODO: process raw filters to match query string of backend
            Object.keys(filters).forEach(key =>
              //@ts-ignore
              currentUrlParams.set(key, filters[key])
            );
            history.push(
              window.location.pathname + '?' + currentUrlParams.toString()
            );
          }}
          updateInitialValues={(filters: FilterAttrs) =>
            setInitialValues(filters)
          }
          initialValues={initialValues}
        />
      )}
    </div>
  );
};

const mapStateToProps = (state: StoreState) => {
  return { user: state.user, currentLocation: state.currentLocation };
};

//@ts-ignore
export const SearchInput = connect(mapStateToProps)(_SearchInput);
