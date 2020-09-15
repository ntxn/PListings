import mongoose from 'mongoose';

import { Model, ModelAttribute } from '../utils';
import { ListingDoc, UserDoc } from './index';

export interface ChatroomAttr extends ModelAttribute {
  listing: mongoose.Types.ObjectId;
  buyer: mongoose.Types.ObjectId;
  seller: mongoose.Types.ObjectId;
}

export interface ChatroomDoc extends mongoose.Document {
  listing: ListingDoc;
  buyer: UserDoc;
  seller: UserDoc;
  deletedByBuyer: boolean;
  deletedBySeller: boolean;
}

type ChatroomModel = Model<ChatroomAttr, ChatroomDoc>;

const displayOptions = {
  transform(doc: ChatroomDoc, ret: ChatroomDoc) {
    ret.id = ret._id;
    delete ret._id;
  },
  versionKey: false,
  virtuals: true,
};

const chatroomSchema = new mongoose.Schema(
  {
    listing: {
      type: mongoose.Types.ObjectId,
      required: [true, 'Listing Id is required'],
      ref: 'Listing',
      index: true,
    },
    buyer: {
      type: mongoose.Types.ObjectId,
      required: [true, 'Buyer Id is required'],
      ref: 'User',
    },
    seller: {
      type: mongoose.Types.ObjectId,
      required: [true, 'Seller Id is required'],
      ref: 'User',
    },
    deletedByBuyer: {
      type: Boolean,
      default: false,
    },
    deletedBySeller: {
      type: Boolean,
      default: false,
    },
  },
  { toJSON: displayOptions, toObject: displayOptions }
);

chatroomSchema.index({ listing: 1, buyer: 1, seller: 1 }, { unique: true });

// Virtual Populate Messages of a chat room
chatroomSchema.virtual('messages', {
  ref: 'Message',
  foreignField: 'roomId',
  localField: '_id',
});

const listingPopulatedOption = {
  path: 'listing',
  select: 'id photos title price location',
};

const sellerPopulatedOption = {
  path: 'seller',
  select: 'id name photo location',
};

const buyerPopulatedOption = {
  path: 'buyer',
  select: 'id name photo location',
};

chatroomSchema.pre('save', function (next) {
  (this as mongoose.Document)
    .populate(listingPopulatedOption)
    .populate(sellerPopulatedOption)
    .populate(buyerPopulatedOption)
    .execPopulate();

  next();
});

chatroomSchema.pre(/^find/, function (next) {
  (this as mongoose.Query<ChatroomDoc>)
    .populate(listingPopulatedOption)
    .populate(sellerPopulatedOption)
    .populate(buyerPopulatedOption)
    .populate('messages')
    .sort({ 'messages.updatedAt.0': 1 });

  next();
});

chatroomSchema.statics.build = (attrs: ChatroomAttr) => new Chatroom(attrs);

export const Chatroom = mongoose.model<ChatroomDoc, ChatroomModel>(
  'Chatroom',
  chatroomSchema
);
