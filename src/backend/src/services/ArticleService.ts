import { QueryResult } from 'mysql2';
import connection from './DatabaseService';
import Article from '../models/Article';

class ArticleService {
  getArticles(userId: string): Promise<QueryResult> {
    const sql = `
      SELECT
        article.id, article.title, article.contents, article.is_published, article.created_by, article.created_at, article.updated_by, article.updated_at, COALESCE(COUNT(favorite.user_id), 0) AS fav_count
      FROM article
      LEFT JOIN favorite ON article.id = favorite.article_id
      WHERE is_published = TRUE OR article.created_by = :userId
      GROUP BY article.id
      ORDER BY created_at
    `;
    return new Promise((resolve, reject) => {
      connection.query(sql, {userId: userId}, (error, results) => {
        if (error) {
          reject(error);
        } else {
          resolve(results);
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
      connection.getConnection((err, connection) => {
        if (err) {
          reject(err);
          return;
        }

        const deleteFavoritesQuery = `DELETE FROM favorite WHERE article_id = :id`;
        const deleteArticleQuery = `DELETE FROM article WHERE id = :id`;

        // トランザクションを開始する
        connection.beginTransaction((err) => {
          if (err) {
            connection.release();
            reject(err);
            return;
          }

          // 記事のいいねテーブルのレコードを削除
          connection.query(deleteFavoritesQuery, { id: id }, (error, favoriteResults) => {
            if (error) {
              // ロールバックしてエラーを返す
              connection.rollback(() => {
                connection.release();
                reject(error);
              });
              return;
            }

            // 記事テーブルのレコードを削除
            connection.query(deleteArticleQuery, { id: id }, (error, articleResults) => {
              if (error) {
                // ロールバックしてエラーを返す
                connection.rollback(() => {
                  connection.release();
                  reject(error);
                });
                return;
              }

              // コミットして成功を返す
              connection.commit((err) => {
                if (err) {
                  // コミットに失敗した場合はロールバックしてエラーを返す
                  connection.rollback(() => {
                    connection.release();
                    reject(err);
                  });
                  return;
                }

                // コネクションを解放して結果を返す
                connection.release();
                resolve(articleResults);
              });
            });
          });
        });
      });
    });
  }
}

export default ArticleService;