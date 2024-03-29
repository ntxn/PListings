import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import validator from 'validator';
import jwt from 'jsonwebtoken';
import { ListingDoc } from './listing';
import { UserRole, AccountStatus, ErrMsg, GeoLocation } from '../../common';
import { Model, ModelAttribute } from '../utils';

export interface UserAttrs extends ModelAttribute {
  name: string;
  email: string;
  location: GeoLocation;
  password: string;
  passwordConfirm: string;
  photo?: string;
  bio?: string;
}

export interface UserDoc extends mongoose.Document {
  name: string;
  email: string;
  location: GeoLocation;
  photo?: string;
  bio?: string;
  role: UserRole;
  status: AccountStatus;
  createdAt: Date;
  updatedAt: Date;
  password: string;
  passwordConfirm?: string;
  passwordChangedAt?: Date;
  tokens: { token: string }[];
  passwordResetToken?: string;
  passwordResetExpires?: number;
  listings: ListingDoc[];
  correctPassword(password: string): Promise<boolean>;
  removeExpiredTokens(): void;
}

interface UserModel extends Model<UserAttrs, UserDoc> {
  findOneByIdAndToken(
    id: mongoose.Types.ObjectId,
    token: string
  ): Promise<UserDoc>;
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
    delete ret.status;
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
    photo: String,
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
      zip: {
        type: String,
        required: [true, ErrMsg.LocationZipRequired],
      },
      city: {
        type: String,
        required: [true, ErrMsg.LocationCityRequired],
      },
      state: {
        type: String,
        required: [true, ErrMsg.LocationStateRequired],
      },
      country: {
        type: String,
        required: [true, ErrMsg.LocationCountryRequired],
      },
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
    status: {
      type: String,
      enum: Object.values(AccountStatus),
      default: AccountStatus.Active,
    },
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
          // @ts-ignore
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
    timestamps: true,
  }
);

userSchema.index({ _id: 1, 'tokens.token': 1 });

// Virtual populate
userSchema.virtual('listings', {
  ref: 'Listing',
  foreignField: 'owner',
  localField: '_id',
});

// hash new/updated password
userSchema.pre('save', async function (next) {
  const userDoc = this as UserDoc;
  if (userDoc.isModified('password')) {
    userDoc.password = await bcrypt.hash(userDoc.password, 12);
    if (!userDoc.isNew) userDoc.passwordChangedAt = new Date(Date.now() - 1000);
    userDoc.passwordConfirm = undefined;
    userDoc.tokens = [];
  }

  next();
});

// Compare if the provided password is the same as the stored password
userSchema.methods.correctPassword = async function (
  password: string
): Promise<boolean> {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.removeExpiredTokens = function () {
  const userDoc = this as UserDoc;
  const nowTimestamp = new Date(Date.now()).getTime() / 1000;

  userDoc.tokens = userDoc.tokens.filter(({ token }) => {
    const decoded = jwt.decode(token);
    // @ts-ignore
    return decoded!.exp > nowTimestamp;
  });
};

// Class method to create an instance while ultilize Typescript type checking
userSchema.statics.build = (attrs: UserAttrs): UserDoc => new User(attrs);

userSchema.statics.findOneByIdAndToken = async (
  id: mongoose.Types.ObjectId,
  token: string
) =>
  await User.findOne({
    _id: id,
    'tokens.token': token,
  }).populate('listings');

const User = mongoose.model<UserDoc, UserModel>('User', userSchema);

export { User };
