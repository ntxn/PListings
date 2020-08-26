import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { FiSearch } from 'react-icons/fi';
import { IoIosOptions } from 'react-icons/io';

import { FiltersModal } from './Modal';
import { history } from '../history';
import {
  FilterAttrs,
  StoreState,
  processFiltersToQueryString,
} from '../utilities';

interface SearchInputProps {
  defaultFilters: FilterAttrs;
}

const _SearchInput = (props: SearchInputProps): JSX.Element => {
  const [initialValues, setInitialValues] = useState(props.defaultFilters);
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setInitialValues(props.defaultFilters);
  }, props.defaultFilters.location.coordinates);

  const applyFilters = (filters: FilterAttrs) => {
    const queryStr = processFiltersToQueryString(filters);
    history.push(window.location.pathname + '?' + queryStr);
  };

  return (
    <div className="search-input">
      <div
        className="search-input__search"
        onKeyDown={event => {
          if (event.keyCode === 13)
            applyFilters({ ...initialValues, searchTerm });
        }}
      >
        <input
          type="text"
          className="search-input__search--input"
          placeholder="Search plistings"
          value={searchTerm}
          onChange={event => setSearchTerm(event.target.value)}
        />

        <FiSearch
          title="Click to search"
          onClick={() => applyFilters({ ...initialValues, searchTerm })}
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
          applyFilters={applyFilters}
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
  return { defaultFilters: state.defaultFilters };
};

//@ts-ignore
export const SearchInput = connect(mapStateToProps)(_SearchInput);
