// import express from 'express';
//
// const router = express.Router();
//
// router.get('/', (req, res) => {
//     res.send('index');
// });
//
// export default router;

import Router from 'koa-router';
import appointment from './appointment';

const api = new Router();

api.use('/appointments', appointment.routes());

export default api;