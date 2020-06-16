import { MiddlewareHandler, CustomRequest, AppError } from '../utils';
import { ErrMsg, UserRole } from '../../common';

export const accessRestrictor = (...roles: UserRole[]): MiddlewareHandler => (
  req: CustomRequest,
  res,
  next
) => {
  if (!roles.includes(req.user!.role))
    return next(new AppError(ErrMsg.AccessRestriction, 403));
  next();
};
