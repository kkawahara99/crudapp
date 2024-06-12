-- 記事テーブルにサンプルデータを挿入
INSERT INTO article (id, title, contents, is_published, created_by, created_at, updated_by, updated_at)
SELECT 
  UUID(),
  CONCAT('Sample Title ', seq),
  CONCAT('Sample content ', seq),
  IF(RAND() > 0.5, TRUE, FALSE),
  CONCAT('user', seq),
  DATE_ADD(NOW(), INTERVAL -FLOOR(RAND() * 365) DAY),
  CONCAT('user', seq),
  DATE_ADD(NOW(), INTERVAL -FLOOR(RAND() * 365) DAY)
FROM 
  (SELECT @rownum := @rownum + 1 AS seq FROM 
    (SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9 UNION ALL SELECT 10) t1,
    (SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9 UNION ALL SELECT 10) t2,
    (SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9 UNION ALL SELECT 10) t3,
    (SELECT @rownum := 0) r
  ) t
LIMIT 100;

-- サンプルユーザー100人を作成
SET @max_user = 100;

-- 各記事に対してランダムな数のいいねを付ける
-- 1つの記事に対して最大10個のいいねを付けるようにしています
SET @max_likes_per_article = 10;

-- いいねテーブルにサンプルデータを挿入
INSERT INTO favorite (article_id, user_id, fav_at)
SELECT 
  a.id,
  CONCAT('user', FLOOR(RAND() * @max_user) + 1),
  DATE_ADD(NOW(), INTERVAL -FLOOR(RAND() * 365) DAY)
FROM 
  article a,
  (SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9 UNION ALL SELECT 10) num_likes
WHERE 
  RAND() < 0.5 -- 各記事に対していいねが付く確率を50%にしています。調整可能
ORDER BY 
  RAND()
LIMIT 100;

-- 重複を排除し、同じ記事に同じユーザーがいいねを付けないようにする
DELETE FROM favorite
WHERE (article_id, user_id) IN (
  SELECT article_id, user_id
  FROM (
    SELECT article_id, user_id, COUNT(*)
    FROM favorite
    GROUP BY article_id, user_id
    HAVING COUNT(*) > 1
  ) t
);

-- ユニークな組み合わせのみを保持
INSERT INTO favorite (article_id, user_id, fav_at)
SELECT article_id, user_id, fav_at
FROM (SELECT DISTINCT article_id, user_id, fav_at FROM favorite) t
ON DUPLICATE KEY UPDATE fav_at = VALUES(fav_at);
