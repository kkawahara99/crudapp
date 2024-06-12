import { Request, Response } from 'express';
import FavoriteService from '../services/FavoriteService';

const favoriteService = new FavoriteService();

export const getTotalFavOfArticle = async (req: Request, res: Response) => {
  try {
    const articleId = req.query.articleId as string;

    const totalFav = await favoriteService.getTotalFavOfArticle(articleId);
    res.status(200).json(totalFav);
  } catch (e) {
    if (e instanceof Error) {
      res.status(500).json({ message: e.message });
    }
  }
};

export const clickFavorite = async (req: Request, res: Response) => {
  try {
    const { articleId, userId } = req.body;

    const favorites = await favoriteService.getFavOfArticle(articleId, userId);
    console.log(favorites);
    const count = favorites[0].count;

    let result;
    if (count === 0) {
      // まだいいねされていない場合はいいねテーブルに追加する
      result = await favoriteService.addFavToArticle(articleId, userId);
    } else {
      // いいねされている場合はいいねテーブルから削除する
      result = await favoriteService.subFavToArticle(articleId, userId);
    }

    res.status(200).json(result);
  } catch (e) {
    if (e instanceof Error) {
      res.status(500).json({ message: e.message });
    }
  }
};