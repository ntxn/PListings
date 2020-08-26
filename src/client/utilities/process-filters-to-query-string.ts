import { FilterAttrs } from './interfaces';
import { SortOptions, PostedWithin, PostedWithinOption } from '../../common';

export const processFiltersToQueryString = (filters: FilterAttrs): string => {
  const currentUrlParams = new URLSearchParams(window.location.search);

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

  return currentUrlParams.toString();
};
