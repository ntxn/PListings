// import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import validator from 'validator';
import { UserRole, ErrMsg } from '../../common';
import { Model, ModelAttribute } from '../utils';

export interface UserAttrs extends ModelAttribute {
  name: string;
  email: string;
  photo?: string;
  location?: {
    lat: number;
    lng: number;
  };
  bio?: string;
  password: string;
  passwordConfirm: string;
}

export interface UserDoc extends mongoose.Document {
  name: string;
  email: string;
  photo?: string;
  location?: {
    lat: number;
    lng: number;
  };
  bio?: string;
  role: UserRole;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  password: string;
  passwordConfirm?: string;
  passwordChangedAt?: Date;
  tokens: { token: string }[];
  passwordResetToken?: string[];
  passwordResetExpires?: Date;
  correctPassword?(password: string): Promise<boolean>;
}

type UserModel = Model<UserAttrs, UserDoc>;

const displayOptions = {
  transform(doc: UserDoc, ret: UserDoc) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.password;
    delete ret.passwordChangedAt;
    delete ret.passwordResetToken;
    delete ret.passwordResetExpires;
    delete ret.role;
    delete ret.active;
    delete ret.tokens;
  },
  versionKey: false,
  virtuals: true,
};

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, ErrMsg.NameRequired],
      trim: true,
    },
    email: {
      type: String,
      required: [true, ErrMsg.EmailRequired],
      unique: true,
      trim: true,
      lowercase: true,
      validate: [validator.isEmail, ErrMsg.EmailInvalid],
    },
    photo: {
      type: String,
      default: 'default.jpg',
    },
    location: {
      lat: Number,
      lng: Number,
    },
    bio: {
      type: String,
      trim: true,
      maxlength: [150, ErrMsg.BioMaxLength],
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.User,
    },
    active: {
      type: Boolean,
      default: true,
    },
    createdAt: {
      type: Date,
      default: new Date(),
    },
    updatedAt: Date,
    password: {
      type: String,
      minlength: [8, ErrMsg.PasswordMinLength],
      required: [true, ErrMsg.PasswordRequired],
    },
    passwordConfirm: {
      type: String,
      required: [true, ErrMsg.PasswordConfirmRequired],
      validate: [
        function (val) {
          return val === this.password;
        },
        ErrMsg.PasswordConfirmNotMatch,
      ],
    },
    tokens: [
      {
        token: String,
      },
    ],
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
  },
  {
    toJSON: displayOptions,
    toObject: displayOptions,
  }
);

// hash new/updated password and update `updatedAt` field
userSchema.pre('save', async function (next) {
  const userDoc = this as UserDoc;
  if (userDoc.isModified('password')) {
    userDoc.password = await bcrypt.hash(userDoc.password, 12);
    if (!userDoc.isNew) userDoc.passwordChangedAt = new Date(Date.now() - 1000);
    userDoc.passwordConfirm = undefined;
  }

  if (!userDoc.isNew) userDoc.updatedAt = new Date(Date.now() - 1000);
  next();
});

// Compare if the provided password is the same as the stored password
userSchema.methods.correctPassword = async function (
  password: string
): Promise<boolean> {
  return await bcrypt.compare(password, this.password);
};

// Class method to create an instance while ultilize Typescript type checking
userSchema.statics.build = (attrs: UserAttrs): UserDoc => new User(attrs);

const User = mongoose.model<UserDoc, UserModel>('User', userSchema);

export { User };
