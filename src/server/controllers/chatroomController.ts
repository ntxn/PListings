import { Response, NextFunction } from 'express';

import { controller, use, GET, DELETE } from '../decorators';
import { authenticationChecker } from '../middlewares';
import {
  catchAsync,
  CustomRequest,
  NotAuthorizedError,
  NotFoundError,
} from '../utils';
import { Base, Routes, RequestStatus } from '../../common';
import { Chatroom } from '../models';

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
      const chatrooms = await Chatroom.find({
        $or: [
          { seller: id, deletedBySeller: false },
          { buyer: id, deletedByBuyer: false },
        ],
      });

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
