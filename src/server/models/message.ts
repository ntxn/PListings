import mongoose from 'mongoose';

import { Model, ModelAttribute } from '../utils';
import { MessageStatus } from '../../common';

export interface MessageAttr extends ModelAttribute {
  roomId: mongoose.Types.ObjectId;
  content: string;
  sender: mongoose.Types.ObjectId;
}

export interface MessageDoc extends mongoose.Document {
  roomId: mongoose.Types.ObjectId;
  content: string;
  sender: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  status: MessageStatus;
}

type MessageModel = Model<MessageAttr, MessageDoc>;

const displayOptions = {
  transform(doc: MessageDoc, ret: MessageDoc): void {
    ret.id = ret._id;
    delete ret._id;
  },
  versionKey: false,
};

const messageSchema = new mongoose.Schema(
  {
    roomId: {
      type: mongoose.Types.ObjectId,
      required: [true, 'Chatroom Id is required'],
      index: true,
    },
    content: {
      type: String,
      required: [true, 'Message content is required'],
    },
    sender: {
      type: mongoose.Types.ObjectId,
      required: [true, 'Sender Id is required'],
    },
    status: {
      type: MessageStatus,
      enum: Object.values(MessageStatus),
      default: MessageStatus.Sent,
    },
  },
  { toObject: displayOptions, toJSON: displayOptions, timestamps: true }
);

messageSchema.pre(/^find/, function (next) {
  (this as mongoose.Query<MessageDoc>).sort('updatedAt');

  next();
});

messageSchema.statics.build = (attrs: MessageAttr): MessageDoc =>
  new Message(attrs);

const Message = mongoose.model<MessageDoc, MessageModel>(
  'Message',
  messageSchema
);

export { Message };
