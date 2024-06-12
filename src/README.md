# アプリケーションソースコード

アプリケーションソースコードを格納。

## ディレクトリ構成

    .
    ├── backend             # バックエンド用のソースコード
    ├── frontend            # フロントエンド用のソースコード
    ├── glue                # Glueスクリプト用のソースコード
    ├── mysql               # DB用の各種ファイル（主にローカル開発環境用）
    ├── README.md
    ├── .env                # 環境変数ファイル（主にローカル開発環境用）
    └── docker-compose.yml  # （主にローカル開発環境用）

## ローカル環境構築方法

ローカル端末上でDockerコンテナを起動し動作確認する手順を示す。  
ローカルで動かす場合においてもAmazon Cognitoを使用するため一部インターネット通信が生じる。
    
前提条件：
* Docker、docker-composeがインストールされていること。
* AWSアカウントが存在すること。

1. Cognito の構築。
    1. Cognitoサービス画面 の左ペインより`ユーザープール`を押下。
    2. `ユーザープルを作成`ボタン押下。
    3. 次を設定。特に記載がない項目はデフォルトのままとする。
        * Cognito ユーザープールのサインインオプション
            - [x] ユーザー名
            - [x] Eメール
        * ユーザー名要件
            - [x] ユーザーが任意のユーザー名でサインインすることを許可
        * MFA の強制
            * MFA なし
        * E メールプロバイダー
            * Cognito で E メールを送信
        * ユーザープール名
            * 任意
        * アプリケーションクライアント名
            * 任意
1. `.env`ファイル
    以下サンプルのようにDB認証情報を入力する。
    （ローカルで使用するならデフォルトのままでも問題ないはず。）  
    （注意）入力した認証情報はGitHub等にpushしないこと！
    `.gitignore`に`.env`含めてpushされないようにする。

    ```
    DB_HOST=mysql
    DB_NAME=mydb
    DB_USER=admin
    DB_PASS=password
    TZ=Asia/Tokyo
    REACT_APP_AUTH_USER_POOL_ID={ユーザープールID}
    REACT_APP_AUTH_USER_POOL_CLIENT_ID={クライアントID}
    REACT_APP_API_URL=http://localhost:3001/api
    ```
1. 以下コマンドを実行し各コンテナを起動する。
    ```sh
    docker compose up -d
    ```
1. ブラウザで`http://localhost:3000`にアクセスし画面が表示されることを確認する。（コンテナ起動まで暫くかかる。）
1. 以下コマンドを実行し各コンテナを停止する。
    ```sh
    docker compose down
    ```

