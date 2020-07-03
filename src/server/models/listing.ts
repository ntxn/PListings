import mongoose from 'mongoose';
import {
  Conditions,
  Categories,
  Subcategories,
  ErrMsg,
  GeoLocation,
} from '../../common';
import { Model, ModelAttribute } from '../utils';
import { UserDoc } from '../models';

export interface ListingAttrs extends ModelAttribute {
  title: string;
  photos: string[];
  price: number;
  category: Categories;
  subcategory: string;
  location: GeoLocation;
  owner: mongoose.Types.ObjectId;
  condition?: Conditions;
  description?: string;
  brand?: string;
}

export interface ListingDoc extends mongoose.Document {
  title: string;
  photos: string[];
  price: number;
  category: Categories;
  subcategory: string;
  location: GeoLocation;
  owner: UserDoc;
  condition?: Conditions;
  description?: string;
  brand?: string;
  createdAt: Date;
  updatedAt: Date;
  visits: number;
  favorites: number;
  active: boolean;
  sold: boolean;
  featured: boolean; // paid for moving listing to top or at top listings
}

type ListingModel = Model<ListingAttrs, ListingDoc>;

const displayOptions = {
  transform(doc: ListingDoc, ret: ListingDoc) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.featured;
  },
  versionKey: false,
  virtuals: true,
};

const listingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      require: [true, ErrMsg.TitleRequired],
      maxlength: [70, ErrMsg.TitleMaxLength],
      trim: true,
    },
    photos: {
      type: [String],
      required: [true, ErrMsg.PhotosRequired],
      validate: [
        photos => photos.length > 0 && photos.length <= 10,
        ErrMsg.PhotosLength,
      ],
    },
    price: {
      type: Number,
      required: [true, ErrMsg.PriceRequired],
      validate: [price => price > 0, ErrMsg.PriceNegative],
    },
    category: {
      type: String,
      required: [true, ErrMsg.CategoryRequired],
      enum: Object.values(Categories),
    },
    subcategory: {
      type: String,
      required: [true, ErrMsg.SubcategoryRequired],
      validate: [
        function (val) {
          // @ts-ignore
          return this && val in Subcategories[this.category];
        },
        ErrMsg.SubcategoryNotInCategory,
      ],
    },
    location: {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: {
        type: [Number], // [Long, Lat]
        required: [true, ErrMsg.LocationCoorsRequired],
        validate: [
          (coors: number[]) => coors.length > 0 && coors.length < 3,
          ErrMsg.LocationCoorsLength,
        ],
      },
      postal: Number,
      city: String,
      state: String,
      country: String,
      // postal: {
      //   type: Number,
      //   required: [true, ErrMsg.LocationPostalRequired],
      // },
      // city: {
      //   type: String,
      //   required: [true, ErrMsg.LocationCityRequired],
      // },
      // state: {
      //   type: String,
      //   required: [true, ErrMsg.LocationStateRequired],
      // },
      // country: {
      //   type: String,
      //   required: [true, ErrMsg.LocationCountryRequired],
      // },
    },
    owner: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
      required: [true, ErrMsg.OwnerRequired],
    },
    condition: {
      type: String,
      enum: Object.values(Conditions),
    },
    description: {
      type: String,
      maxlength: [1450, ErrMsg.DescriptionMaxLength],
    },
    brand: {
      type: String,
      maxlength: [100, ErrMsg.BrandMaxLength],
    },
    visits: {
      type: Number,
      default: 0,
    },
    favorites: {
      type: Number,
      default: 0,
    },
    active: {
      type: Boolean,
      default: true,
    },
    sold: {
      type: Boolean,
      default: false,
    },
    featured: {
      type: Boolean,
      default: false,
    },
  },
  {
    toJSON: displayOptions,
    toObject: displayOptions,
    timestamps: true,
  }
);

listingSchema.pre(/^find/, function (next) {
  (this as mongoose.Query<any>).populate({
    path: 'owner',
    select: 'id name photo',
  });
  next();
});

listingSchema.statics.build = (attrs: ListingAttrs) => new Listing(attrs);

const Listing = mongoose.model<ListingDoc, ListingModel>(
  'Listing',
  listingSchema
);

export { Listing };
