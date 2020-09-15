import { Response, NextFunction } from 'express';

import { controller, use, GET } from '../decorators';
import { authenticationChecker } from '../middlewares';
import { catchAsync, CustomRequest } from '../utils';
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
        $or: [{ seller: id }, { buyer: id }],
      });

      res.status(200).json({ status: RequestStatus.Success, data: chatrooms });
    })(req, res, next);
  }
}
