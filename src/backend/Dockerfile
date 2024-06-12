# ベースイメージを指定
FROM node:latest

# 作業ディレクトリを作成
WORKDIR /app

# パッケージファイルをコピー
COPY package.json package-lock.json ./
RUN npm install

# アプリケーションのソースコードをコピー
COPY . .

# タイムゾーンの設定
RUN ln -snf /usr/share/zoneinfo/Asia/Tokyo /etc/localtime && echo "Asia/Tokyo" > /etc/timezone

# ポート番号を公開
EXPOSE 3000

# アプリケーションを起動
CMD ["npm", "start"]
