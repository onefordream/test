# Square決済リンクの作成手順

SHADOW SPEED STICK(¥6,500)の決済リンクをSquareで発行し、決済完了後に自作の
`thanks.html`(黒×黄色のブランドデザイン)へ戻ってくるように設定する手順です。

アクセストークンは機密情報です。**チャットやコミットには絶対に貼らず**、ご自身の
端末のターミナルでのみ使用してください。

## 1. サイトを公開してURLを確定する

`thanks.html` にアクセスできるURLが先に必要です。GitHub Pagesを使う場合:

1. GitHubリポジトリの `Settings > Pages` を開く
2. `Source` を `main` ブランチ / `/ (root)` に設定して保存
3. 数分後、`https://onefordream.github.io/test/` のようなURLが発行される
4. 決済完了後の戻り先URLは `https://onefordream.github.io/test/thanks.html` になる

(独自ドメインや別ホスティングを使う場合はそのURLに読み替えてください)

## 2. Squareのアクセストークンを取得する

1. [Square Developer Dashboard](https://developer.squareup.com/apps) にログイン
2. アプリを新規作成(未作成の場合)
3. 本番环境の「Access Token」をコピー(テストする場合はSandboxのトークンでもOK)
4. 「Location ID」も控えておく(Square Dashboard > 場所 で確認可能)

## 3. 決済リンクを作成する(ターミナルで実行)

以下のコマンドの `YOUR_ACCESS_TOKEN` と `YOUR_LOCATION_ID` を自分の値に置き換えて、
ターミナルで実行してください(このリポジトリのコードには含めません)。

```bash
curl https://connect.squareup.com/v2/online-checkout/payment-links \
  -X POST \
  -H "Square-Version: 2024-10-17" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "idempotency_key": "shadow-speed-stick-001",
    "quick_pay": {
      "name": "SHADOW SPEED STICK",
      "price_money": { "amount": 6500, "currency": "JPY" },
      "location_id": "YOUR_LOCATION_ID"
    },
    "checkout_options": {
      "redirect_url": "https://onefordream.github.io/test/thanks.html"
    }
  }'
```

- `amount` は最小単位(JPYは円そのもの)なので `6500` = ¥6,500
- `redirect_url` に指定したページへ、決済完了後に自動で戻ってきます
- Sandboxで試す場合はエンドポイントを `https://connect.squareupsandbox.com/...` に変更

レスポンスの `payment_link.url` がお客様に渡す決済ページのURLです。

## 4. LPに反映する

上記で取得したURLを、`index.html` 内のCONFIGブロックにある `PURCHASE_URL` に設定します。

```js
const PURCHASE_URL = "https://square.link/u/xxxxxxxx"; // ← ここに置き換える
```

この1箇所を変更するだけで、LP内すべての購入ボタンに反映されます。

## 注意点

- Square決済ページ自体のデザイン(フォント・配色)はSquare側のテンプレートのため、
  黒×黄色のブランドに完全には合わせられません。ロゴ等の軽微なカスタマイズは
  Square Dashboardの「ビジネス設定」から可能です。
- `thanks.html` は検索エンジンにインデックスされないよう `noindex` を設定済みです。
- 本番運用前に、少額のテスト決済で一連の流れ(購入 → 決済 → thanks.htmlへ戻る)を
  必ず確認してください。
