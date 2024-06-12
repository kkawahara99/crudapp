import { QueryResult } from 'mysql2';
import connection from './DatabaseService';
import Favorite from '../models/Favorite';

class FavoriteService {
  getTotalFavOfArticle(articleId: string): Promise<{ count: number }[]> {
    const sql = `SELECT COUNT(*) as count FROM favorite WHERE article_id = :articleId`;
    return new Promise((resolve, reject) => {
      connection.query(sql, {articleId: articleId}, (error, results) => {
        if (error) {
          reject(error);
        } else {
          resolve(results as { count: number }[]);
        }
      });
    });
  }

  getFavOfArticle(articleId: string, userId: string): Promise<{ count: number }[]> {
    const sql = `SELECT COUNT(*) as count FROM favorite WHERE article_id=:articleId AND user_id=:userId`;
    return new Promise((resolve, reject) => {
      connection.query(sql, {articleId: articleId, userId: userId}, (error, results) => {
        if (error) {
          reject(error);
        } else {
          resolve(results as { count: number }[]);
        }
      });
    });
  }

  addFavToArticle(articleId: string, userId: string): Promise<QueryResult> {
    return new Promise((resolve, reject) => {
      const query = `INSERT INTO favorite (article_id, user_id, fav_at) VALUES (:articleId, :userId, NOW())`;
      connection.query(query, {articleId: articleId, userId: userId}, (error, results) => {
        if (error) {
          reject(error);
        } else {
          resolve(results);
        }
      });
    });
  }

  subFavToArticle(articleId: string, userId: string): Promise<QueryResult> {
    return new Promise((resolve, reject) => {
      const query = `DELETE FROM favorite WHERE article_id=:articleId AND user_id=:userId`;
      connection.query(query, {articleId: articleId, userId: userId}, (error, results) => {
        if (error) {
          reject(error);
        } else {
          resolve(results);
        }
      });
    });
  }
}

export default FavoriteService;