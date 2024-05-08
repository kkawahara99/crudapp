import { QueryResult } from 'mysql2';
import connection from './DatabaseService';
import Article from '../models/Article';

class ArticleService {
  getArticles(userId: string): Promise<Article[]> {
    const sql = `SELECT * FROM article WHERE is_published = TRUE OR created_by = :createdBy ORDER BY created_at`;
    return new Promise((resolve, reject) => {
      connection.query(sql, {createdBy: userId}, (error, results) => {
        if (error) {
          reject(error);
        } else {
          resolve(results as Article[]);
        }
      });
    });
  }

  getArticle(id: string): Promise<Article[]> {
    return new Promise((resolve, reject) => {
      const sql = `SELECT * FROM article  WHERE id=:id`;
      connection.query(sql, {id: id}, (error, results) => {
        if (error) {
          reject(error);
        } else {
          resolve(results as Article[]);
        }
      });
    });
  }

  createArticles(article: Article): Promise<QueryResult> {
    return new Promise((resolve, reject) => {
      const query = `INSERT INTO article (id, title, contents, is_published, created_by, created_at, updated_by, updated_at) VALUES (:id, :title, :contents, :isPublished, :createdBy, NOW(), :updatedBy, NOW())`;
      connection.query(query, article, (error, results) => {
        if (error) {
          reject(error);
        } else {
          resolve(results);
        }
      });
    });
  }

  updateArticles(article: Article): Promise<QueryResult> {
    return new Promise((resolve, reject) => {
      const query = `UPDATE article SET title=:title, contents=:contents, is_published=:isPublished, updated_by=:updatedBy, updated_at=NOW() WHERE id=:id`;
      connection.query(query, article, (error, results) => {
        if (error) {
          reject(error);
        } else {
          resolve(results);
        }
      });
    });
  }

  deleteArticles(id: string): Promise<QueryResult> {
    return new Promise((resolve, reject) => {
      const query = `DELETE FROM article WHERE id=:id`;
      connection.query(query, {id: id}, (error, results) => {
        if (error) {
          reject(error);
        } else {
          resolve(results);
        }
      });
    });
  }
}

export default ArticleService;