FROM mysql:8.0.37-debian

COPY my.cnf /etc/mysql/conf.d/my.cnf
COPY ./init /docker-entrypoint-initdb.d/

# 日本語環境を追加
RUN apt-get update \
  && apt-get install -y locales \
  && sed -i -E 's/# (ja_JP.UTF-8)/\1/' /etc/locale.gen \
  && locale-gen \
  && update-locale LANG=ja_JP.UTF-8 \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/*

ENV LC_ALL ja_JP.UTF-8

CMD ["mysqld"]