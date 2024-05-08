import { Request, Response } from 'express';
import ArticleService from '../services/ArticleService';
import { v4 as uuidv4 } from "uuid";

const articleService = new ArticleService();

export const getArticles = async (req: Request, res: Response) => {
  try {
    const userId = req.query.userId as string;

    const articles = await articleService.getArticles(userId);
    res.status(200).json(articles);
  } catch (e) {
    if (e instanceof Error) {
      res.status(500).json({ message: e.message });
    }
  }
};

export const getArticle = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const articles = await articleService.getArticle(id);
    res.status(200).json(articles);
  } catch (e) {
    if (e instanceof Error) {
      res.status(500).json({ message: e.message });
    }
  }
};

export const createArticle = async (req: Request, res: Response) => {
  try {
    const { title, contents, isPublished, createdBy, updatedBy } = req.body;
    const id = uuidv4();
    const newArticle = {
      id,
      title,
      contents,
      isPublished,
      createdBy,
      updatedBy,
    }

    const articles = await articleService.createArticles(newArticle);
    res.status(200).json(articles);
  } catch (e) {
    if (e instanceof Error) {
      res.status(500).json({ message: e.message });
    }
  }
};

export const updateArticle = async (req: Request, res: Response) => {
  try {
    const { id, title, contents, isPublished, updatedBy } = req.body;
    const newArticle = {
      id,
      title,
      contents,
      isPublished,
      updatedBy,
    }

    const articles = await articleService.updateArticles(newArticle);
    res.status(200).json(articles);
  } catch (e) {
    if (e instanceof Error) {
      res.status(500).json({ message: e.message });
    }
  }
};

export const deleteArticle = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const articles = await articleService.deleteArticles(id);
    res.status(200).json(articles);
  } catch (e) {
    if (e instanceof Error) {
      res.status(500).json({ message: e.message });
    }
  }
};