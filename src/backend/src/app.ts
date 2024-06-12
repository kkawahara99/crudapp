import express, { Application, Request, Response } from "express";
import cors from "cors";
import helloRoutes from './routes/helloRoutes';
import articleRoutes from './routes/articleRoutes';
import favoriteRoutes from './routes/favoriteRoutes';
import { errorHandler } from './utils/ErrorHandler';

const app: Application = express();

app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', helloRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/favorite', favoriteRoutes);

app.use(errorHandler);

export default app;