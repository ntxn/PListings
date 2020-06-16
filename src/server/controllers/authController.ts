import { Request, Response, NextFunction } from 'express';
import { controller, GET, POST, PATCH } from '../decorators';
import { Routes, ResourceRoutes } from '../../common';
import { User } from '../models';
import { catchAsync } from '../utils';

/******* Local middleware / helper functions *******/

/******* Class Declaration *******/
@controller(ResourceRoutes.Auth)
class AuthController {
  // No restriction routes
  @POST(Routes.SignUp)
  signup(req: Request, res: Response, next: NextFunction): void {
    catchAsync(async (req, res, next) => {
      const { name, email, password, passwordConfirm } = req.body;
      const user = User.build({
        name,
        email,
        password,
        passwordConfirm,
      });
      await user.save();

      res.status(201).json({
        status: 'success',
        data: user,
      });
    })(req, res, next);
  }

  @POST(Routes.LogIn)
  login(req: Request, res: Response): void {
    res.send('Log in');
  }

  @POST(Routes.ForgotPassword)
  sendResetPasswordToken(req: Request, res: Response): void {
    res.send('Forgot password, Send reset password token');
  }

  @PATCH(Routes.ResetPassword)
  resetPassword(req: Request, res: Response): void {
    res.send('resetPassword');
  }

  // User-authorized Routes
  @GET(Routes.LogOut)
  logout(req: Request, res: Response): void {
    res.send('Log Out');
  }
}
