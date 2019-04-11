import express from 'express';
import routes from './routes';

const app = express();

let port = 3000;

app.use('/', express.static(`${__dirname}/../public`));
app.use('/index', routes);

const server = app.listen(port, () => {
    console.log(`server on port #${port}`);
});