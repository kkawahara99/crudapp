USE mydb;

CREATE TABLE IF NOT EXISTS article (
  id CHAR(36) NOT NULL,
  title VARCHAR(20) NOT NULL,
  contents VARCHAR(100) NOT NULL,
  is_published boolean NOT NULL,
  created_by VARCHAR(40) NOT NULL,
  created_at datetime NOT NULL,
  updated_by VARCHAR(40) NOT NULL,
  updated_at datetime NOT NULL,
  PRIMARY KEY (id)
);

GRANT ALL PRIVILEGES ON mydb.* TO 'admin'@'%';
FLUSH PRIVILEGES;
