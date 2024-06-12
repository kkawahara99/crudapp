# フロントエンド

TypeScript/React.js で構成したフロントエンドアプリケーション。  
記事投稿ができる簡単な画面IFを提供する。

## ディレクトリ構成

    .
    ├── public
    │   ├── favicon.ico
    │   ├── index.html          # 公開するHTMLファイル。ページタイトル、metaデータ等を実装する。
    │   ├── manifest.json
    │   └── robots.txt
    ├── src
    │   ├── aws-config
    │   │   └── auth.ts         # 認証に関する定義。
    │   ├── components          # pagesから呼び出されるコンポーネントを実装する。
    │   ├── hooks
    │   │   └── use-auth.tsx    # 認証に関する処理を実装する。
    │   ├── pages               # 各ページを実装する。
    │   ├── App.css
    │   ├── App.test.tsx
    │   ├── App.tsx             # 主に各ページへのパスルーティングを実装する。
    │   ├── index.css
    │   ├── index.tsx           # エントリポイント。
    │   ├── logo.svg
    │   ├── reportWebVitals.ts
    │   └── setupTests.ts
    ├── Dockerfile
    ├── README.md
    ├── package-lock.json
    ├── package.json
    └── tsconfig.json
