### ステージ1 ###

# ベースイメージを指定
FROM node:20-alpine as build

# 環境変数を引数として受け取る
ARG REACT_APP_AUTH_USER_POOL_ID
ARG REACT_APP_AUTH_USER_POOL_CLIENT_ID
ARG REACT_APP_API_URL
ARG REACT_APP_COMMIT_HASH

# 環境変数を設定
ENV REACT_APP_AUTH_USER_POOL_ID=${REACT_APP_AUTH_USER_POOL_ID}
ENV REACT_APP_AUTH_USER_POOL_CLIENT_ID=${REACT_APP_AUTH_USER_POOL_CLIENT_ID}
ENV REACT_APP_API_URL=${REACT_APP_API_URL}
ENV REACT_APP_COMMIT_HASH=${REACT_APP_COMMIT_HASH}

# 作業ディレクトリを作成
WORKDIR /app

# パッケージファイルをコピー
COPY package.json package-lock.json ./
RUN npm install

# アプリケーションのソースコードをコピー
COPY . .

# ビルド
RUN npm run build


### ステージ2 ##

# 使用するサーバーを指定
FROM httpd:alpine

# タイムゾーンデータをインストールし、タイムゾーンを設定
RUN apk add --no-cache tzdata \
    && cp /usr/share/zoneinfo/Asia/Tokyo /etc/localtime \
    && echo "Asia/Tokyo" > /etc/timezone

# Apacheのデフォルトのドキュメントルートを削除
RUN rm -rf /usr/local/apache2/htdocs/*

# ビルドされたReactアプリをApacheのドキュメントルートにコピー
COPY --from=build /app/build /usr/local/apache2/htdocs/

# Apacheのポートを公開
EXPOSE 80

# Apacheを起動
CMD ["httpd-foreground"]
