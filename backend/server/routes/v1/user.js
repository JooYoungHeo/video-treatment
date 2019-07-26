import Router from 'koa-router';
import {UserController} from '../../controller/v1';

const userRouter = new Router();
const _userController = new UserController();

userRouter
    .post('/login', _userController.login);

export default userRouter;