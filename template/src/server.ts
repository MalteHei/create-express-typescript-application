import express from 'express';
import cors from 'cors';

export const port = Number(process.env.PORT || 8080);

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
export default app;
