USE mydb;

-- 記事テーブル
CREATE TABLE IF NOT EXISTS article (
  id CHAR(36) NOT NULL,
  title VARCHAR(20) NOT NULL,
  contents TEXT NOT NULL,
  is_published boolean NOT NULL,
  created_by VARCHAR(40) NOT NULL,
  created_at datetime NOT NULL,
  updated_by VARCHAR(40) NOT NULL,
  updated_at datetime NOT NULL,
  PRIMARY KEY (id)
);

-- いいねテーブル
CREATE TABLE IF NOT EXISTS favorite (
  article_id CHAR(36) NOT NULL,
  user_id VARCHAR(40) NOT NULL,
  fav_at datetime NOT NULL,
  PRIMARY KEY (article_id, user_id),
  FOREIGN KEY (article_id) REFERENCES article(id)
);

GRANT ALL PRIVILEGES ON mydb.* TO 'admin'@'%';
FLUSH PRIVILEGES;
