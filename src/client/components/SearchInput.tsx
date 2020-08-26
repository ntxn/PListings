import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { FiSearch } from 'react-icons/fi';
import { IoIosOptions } from 'react-icons/io';

import { FiltersModal } from './Modal';
import { history } from '../history';
import { FilterAttrs, StoreState } from '../utilities';
import { SortOptions, PostedWithin, PostedWithinOption } from '../../common';

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

  const currentUrlParams = new URLSearchParams(window.location.search);

  const applyFilters = (filters: FilterAttrs) => {
    // distance, sort, category, subcategory
    const { distance, category, subcategory, sort, postedWithin } = filters;
    currentUrlParams.set('distance', distance);
    currentUrlParams.set('sort', SortOptions[sort]);
    if (category) currentUrlParams.set('category', category);
    if (subcategory) currentUrlParams.set('subcategory', subcategory);

    // TODO: process searchTerm

    // prep location
    let lng = filters.location.longitude,
      lat = filters.location.latitude;
    const { coordinates } = filters.location;
    if (coordinates) [lng, lat] = coordinates;
    currentUrlParams.set('location', `${lng},${lat}`);

    // Posted Within
    if (postedWithin !== PostedWithin.AllListings) {
      const date = new Date();
      date.setDate(date.getDate() - PostedWithinOption[postedWithin]);
      currentUrlParams.set('createdAt[gte]', date.toISOString());
    }

    // Price
    const { minPrice, maxPrice } = filters;
    if (minPrice) currentUrlParams.set('price[gte]', minPrice);
    if (maxPrice) currentUrlParams.set('price[lte]', maxPrice);

    history.push(window.location.pathname + '?' + currentUrlParams.toString());
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