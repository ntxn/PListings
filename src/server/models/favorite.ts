import mongoose from 'mongoose';
import { ModelAttribute, Model } from '../utils';

interface FavoriteAttr extends ModelAttribute {
  user: mongoose.Types.ObjectId;
  listing: mongoose.Types.ObjectId;
}

interface FavoriteDoc extends mongoose.Document {
  user: mongoose.Types.ObjectId;
  listing: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

type FavoriteModel = Model<FavoriteAttr, FavoriteDoc>;

const displayOptions = {
  transform(doc: FavoriteDoc, ret: FavoriteDoc) {
    ret.id = ret._id;
    delete ret._id;
  },
  versionKey: false,
};

const favoriteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
      require: true,
      index: true,
    },
    listing: {
      type: mongoose.Types.ObjectId,
      ref: 'Listing',
      require: true,
    },
  },
  {
    toJSON: displayOptions,
    toObject: displayOptions,
    timestamps: true,
  }
);

favoriteSchema.index({ user: 1, listing: 1 }, { unique: true });
favoriteSchema.index({ user: 1 });

favoriteSchema.statics.build = (attrs: FavoriteAttr) => new Favorite(attrs);

export const Favorite = mongoose.model<FavoriteDoc, FavoriteModel>(
  'Favorite',
  favoriteSchema
);
