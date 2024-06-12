# Node.jsの公式イメージをベースにする
FROM node:latest

# 作業ディレクトリを設定
WORKDIR /usr/src/app

# ソースコードをコピーして依存関係をインストール
COPY . .
RUN npm install

# タイムゾーンの設定
RUN ln -snf /usr/share/zoneinfo/Asia/Tokyo /etc/localtime && echo "Asia/Tokyo" > /etc/timezone

# ポート番号を公開
EXPOSE 3001

# アプリケーションを起動
CMD ["npm", "start"]
