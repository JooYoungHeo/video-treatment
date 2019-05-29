import express from 'express';

const router = express.Router();

router.get('/', (req, res) => {
    res.send('indexing');
});

export default router;