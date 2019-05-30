import {UserService} from '../../service';

class UserController {

    constructor() {
        this._userService = new UserService();
        this.login = this.login.bind(this);
    }

    async login(ctx) {
        try {
            let body = ctx.request.body || {};

            ctx.body = await this._userService.login(body.qbId, body.qbPassword, body.username, 'Android');
        } catch (e) {
            console.log(e);
            ctx.status = 500;
            ctx.body = e.stack;
        }
    }

}

export default UserController;