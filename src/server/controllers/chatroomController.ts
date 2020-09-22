import { Response, NextFunction } from 'express';
import mongoose from 'mongoose';

import { controller, use, GET, DELETE } from '../decorators';
import { authenticationChecker } from '../middlewares';
import {
  catchAsync,
  CustomRequest,
  NotAuthorizedError,
  NotFoundError,
} from '../utils';
import { Base, Routes, RequestStatus } from '../../common';
import {
  Chatroom,
  listingPopulatedOption,
  buyerPopulatedOption,
  sellerPopulatedOption,
} from '../models';

@controller(Base.Chatrooms)
class ChatroomController {
  /**
   * Query all chatrooms that the current user participates in as a seller or buyer
   */
  @use(authenticationChecker)
  @GET(Routes.ChatroomsByUser)
  getChatroomsByUser(req: CustomRequest, res: Response, next: NextFunction) {
    catchAsync(async (req: CustomRequest, res, next) => {
      const { id } = req.user!;

      // Use Model.aggregate to be able to sort chatrooms based on the created time of the last message
      // Cannot use Virtual property from Mongoose Schema because it cannot sort based on virtual properties
      const chatrooms = await Chatroom.aggregate([
        {
          $match: {
            $or: [
              { seller: mongoose.Types.ObjectId(id), deletedBySeller: false },
              { buyer: mongoose.Types.ObjectId(id), deletedByBuyer: false },
            ],
          },
        },
        {
          $lookup: {
            from: 'messages',
            localField: '_id',
            foreignField: 'roomId',
            as: 'messages',
          },
        },
        {
          $addFields: {
            id: '$_id',
            lastMessage: {
              $let: {
                vars: { last: { $arrayElemAt: ['$messages', -1] } },
                in: '$$last',
              },
            },
          },
        },
        {
          $addFields: {
            'lastMessage.id': '$lastMessage._id',
          },
        },
        {
          $project: {
            _id: 0,
            __v: 0,
            'messages.__v': 0,
            'lastMessage._id': 0,
            'lastMessage.__v': 0,
          },
        },
        {
          $sort: { 'lastMessage.createdAt': -1 },
        },
      ]);

      await Chatroom.populate(chatrooms, [
        listingPopulatedOption,
        sellerPopulatedOption,
        buyerPopulatedOption,
      ]);

      res.status(200).json({ status: RequestStatus.Success, data: chatrooms });
    })(req, res, next);
  }

  /**
   * Delete a chatroom from user's perpective by updating either deletedByBuyer or deletedBySeller to true.
   */
  @use(authenticationChecker)
  @DELETE(Routes.Chatroom)
  deleteChatroom(req: CustomRequest, res: Response, next: NextFunction) {
    catchAsync(async (req: CustomRequest, res, next) => {
      const userId = req.user!.id;
      const chatroomId = req.params.id;

      // Check if this user is part of this chatroom
      const chatroom = await Chatroom.findById(chatroomId);
      if (!chatroom)
        return next(
          new NotFoundError('Cannot find chatroom with the provided ID')
        );

      if (userId == chatroom.buyer.id) chatroom.deletedByBuyer = true;
      else if (userId == chatroom.seller.id) chatroom.deletedBySeller = true;
      else return next(new NotAuthorizedError());

      await chatroom.save();

      res.status(204).json({ status: RequestStatus.Success });
    })(req, res, next);
  }
}
