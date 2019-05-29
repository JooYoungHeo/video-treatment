import Router from 'koa-router';

const appointmentRouter = new Router();

appointmentRouter.get('/', ctx => {
    ctx.body = {fuck: 'fucking'};
});

export default appointmentRouter;