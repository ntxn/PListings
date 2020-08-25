export const SortBy = {
  NewestFirst: 'Newest first',
  ClosestFirst: 'Closest first',
  PriceLowToHigh: 'Price: low to high',
  PriceHighToLow: 'Price: high to low',
};

export const SortOptions = {
  [SortBy.NewestFirst]: 'createdAt',
  [SortBy.ClosestFirst]: 'location',
  [SortBy.PriceLowToHigh]: 'price',
  [SortBy.PriceHighToLow]: '-price',
};

export enum PostedWithin {
  AllListings = 'All listings',
  Last24h = 'Last 24h',
  Last7d = 'Last 7 days',
  Last30d = 'Last 30 days',
}

// export const PostedWithinOption = (date: Date, option: PostedWithin): string | undefined => {
//   let newDate: Date;
//   const yearMonthDate

//   switch (option) {
//     case PostedWithin.AllListings:
//       return undefined;
//     case PostedWithin.Last24h:
//       newDate = date.setHours(date.getHours() + 24);

//   }
// };
