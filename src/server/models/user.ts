// import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { UserRole, errMsg } from '../../common';

interface UserAttrs {
  name: string;
  email: string;
  photo?: string;
  location?: {
    lat: number;
    lng: number;
  };
  bio?: string;
  password: string;
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
  passwordChangedAt?: Date;
  passwordResetToken?: string[];
  passwordResetExpires?: Date;
  correctPassword?(password: string): Promise<boolean>;
}

interface UserModel extends mongoose.Model<UserDoc> {
  build(attrs: UserAttrs): UserDoc;
}

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
  },
  versionKey: false,
  virtuals: true,
};

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, errMsg.NameRequired],
      trim: true,
    },
    email: {
      type: String,
      required: [true, errMsg.EmailRequired],
      unique: [true, errMsg.EmailExisted],
      trim: true,
      lowercase: true,
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
      maxlength: [150, errMsg.BioMaxLength],
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
      minlength: [8, errMsg.PasswordMinLength],
      required: [true, errMsg.PasswordRequired],
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
