# ベースイメージとしてApacheを使用
FROM httpd:alpine

# タイムゾーンデータをインストールし、タイムゾーンを設定
RUN apk add --no-cache tzdata \
    && cp /usr/share/zoneinfo/Asia/Tokyo /etc/localtime \
    && echo "Asia/Tokyo" > /etc/timezone

# Apacheのポートを公開
EXPOSE 80

# Apacheを起動
CMD ["httpd-foreground"]
