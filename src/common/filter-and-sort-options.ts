export const SortBy = {
  NewestFirst: 'Newest first',
  ClosestFirst: 'Closest first',
  PriceLowToHigh: 'Price: low to high',
  PriceHighToLow: 'Price: high to low',
};

export const SortOptions = {
  [SortBy.NewestFirst]: '-createdAt',
  [SortBy.ClosestFirst]: 'location',
  [SortBy.PriceLowToHigh]: 'price',
  [SortBy.PriceHighToLow]: '-price',
};

export const PostedWithin = {
  AllListings: 'All listings',
  Last24h: 'Last 24h',
  Last7d: 'Last 7 days',
  Last30d: 'Last 30 days',
};

export const PostedWithinOption = {
  [PostedWithin.Last24h]: 1,
  [PostedWithin.Last7d]: 7,
  [PostedWithin.Last30d]: 30,
};
