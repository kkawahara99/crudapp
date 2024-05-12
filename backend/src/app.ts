import express, { Application, Request, Response } from "express";
import cors from "cors";
import articleRoutes from './routes/articleRoutes';
import { errorHandler } from './utils/ErrorHandler';

const app: Application = express();

app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/articles', articleRoutes);

app.use(errorHandler);

export default app;