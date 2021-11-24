import express from 'express';
import cors from 'cors';
import config from '../config.json';

export const port = Number(process.env.PORT || config.PORT || 8080);

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
export default app;
