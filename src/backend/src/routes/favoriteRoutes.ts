import express from 'express';
import {
  getTotalFavOfArticle,
  clickFavorite,
} from '../controllers/FavoriteController';

const router = express.Router();

router.get('/', getTotalFavOfArticle);
router.post('/', clickFavorite);

export default router;