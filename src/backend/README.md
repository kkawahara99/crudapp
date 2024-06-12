# バックエンド

TypeScript/Express.js で構成したバックエンドアプリケーション。  
主にフロントエンドから呼び出され、DBへのCRUD操作等を行う。

## ディレクトリ構成

    .
    ├── src
    │   ├── controllers     # 機能毎のコントローラ。受付処理等を実装する。
    │   ├── models          # 機能毎のモデルを実装する。
    │   ├── routes          # 機能毎のパスルーティングを実装する。
    │   ├── services        # 機能毎のビジネスロジックを実装する。
    │   ├── utils           # ユーティリティ。
    │   ├── app.ts          # エントリポイント。パスルーティング等実装する。
    │   └── server.ts       # ポートListen等を指定する。
    ├── Dockerfile
    ├── README.md
    ├── package-lock.json
    ├── package.json
    └── tsconfig.json

