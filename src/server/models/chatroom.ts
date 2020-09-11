import mongoose from 'mongoose';

import { Model, ModelAttribute } from '../utils';
import { ListingDoc, UserDoc } from './index';

interface ChatRoomAttr extends ModelAttribute {
  listing: mongoose.Types.ObjectId;
  buyer: mongoose.Types.ObjectId;
  seller: mongoose.Types.ObjectId;
}

interface ChatRoomDoc extends mongoose.Document {
  listing: ListingDoc;
  buyer: UserDoc;
  seller: UserDoc;
  deletedByBuyer: boolean;
  deletedBySeller: boolean;
}

type ChatRoomModel = Model<ChatRoomAttr, ChatRoomDoc>;

const displayOptions = {
  transform(doc: ChatRoomDoc, ret: ChatRoomDoc) {
    ret.id = ret._id;
    delete ret._id;
  },
  versionKey: false,
  virtuals: true,
};

const chatRoomSchema = new mongoose.Schema(
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

chatRoomSchema.index({ listing: 1, buyer: 1, seller: 1 }, { unique: true });

// Virtual Populate Messages of a chat room
chatRoomSchema.virtual('messages', {
  ref: 'Message',
  foreignField: 'roomId',
  localField: '_id',
});

chatRoomSchema.pre(/^find/, function (next) {
  (this as mongoose.Query<ChatRoomDoc>)
    .populate({
      path: 'listing',
      select: 'id photos title price location',
    })
    .populate({
      path: 'seller',
      select: 'id name photo location',
    })
    .populate({
      path: 'buyer',
      select: 'id name photo location',
    });

  next();
});

chatRoomSchema.statics.build = (attrs: ChatRoomAttr) => new ChatRoom(attrs);

export const ChatRoom = mongoose.model<ChatRoomDoc, ChatRoomModel>(
  'ChatRoom',
  chatRoomSchema
);
