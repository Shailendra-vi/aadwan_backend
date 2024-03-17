import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'

import { newPayment, checkStatus } from './controller/phonepay.js';
import { dbconfigure } from './controller/dbconfigure.js';

const app = express();

app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

app.post('/payment', newPayment);
app.post('/status', checkStatus);
app.post('/addDonateUser', dbconfigure)

const port = process.env.PORT || 5000;

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
