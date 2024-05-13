import dotenv from 'dotenv'
dotenv.config();

import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import cors from 'cors';
import deviceRoutes from './routes/devices.js'
import logsRoutes from './routes/logs.js'

const app = express();
app.use(cors());
app.use(express.json());

app.use('/devices', deviceRoutes);
app.use('/logs', logsRoutes);
 
app.use(bodyParser.json({limit: "30mb", extended: true}));
app.use(bodyParser.urlencoded({limit: "30mb", extended: true}));

mongoose.connect(process.env.MONGODB_URI)
    .then(() => app.listen(process.env.PORT, () => console.log(`Server running on port: ${process.env.URL}${process.env.PORT}`)))
    .catch((error) => console.log(error.message))