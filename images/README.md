# 画像アセット

LP（`index.html`）が参照している画像ファイルです。同名のファイルをここに配置すると、
自動的にプレースホルダー表示から実画像に切り替わります（コード変更は不要）。

| ファイル名 | 用途 | 推奨比率 |
|---|---|---|
| `speed-stick-hero.webp` | ファーストビュー背景 | 横長 |
| `speed-stick-hero-product.png` | ヒーロー右上のスイングビジュアル（右からスライドイン、背景透過） | 正方形〜縦長、背景透過推奨 |
| `pain-visual.png` | 「あと10ヤード、飛ばしたい。」セクション上部のビジュアル（見出し・コピー文字は画像内に配置済み） | 16:9（そのまま全体表示） |
| `pain-cards.png` | 同セクション下部の悩みリスト（見出し・アイコン・文言は画像内に配置済み） | 16:9（そのまま全体表示） |
| `speed-stick-product.webp` | 商品ビジュアル／購入セクション | 4:5 〜 16:10 |
| `taku-profile.webp` | プロゴルファー影山拓真プロフィール写真 | 3:4（縦） |
| `speed-stick-video-poster.webp` | 使用動画のサムネイル | 16:9 |
| `speed-stick-detail-01.webp` / `speed-stick-detail-02.webp` | 商品ディテール写真 | 4:5 |
| `speed-stick-training.webp` | 使用シーン写真 | 4:5 |
| `speed-stick-og.webp` | SNSシェア用OGP画像 | 1200x630 |

形式は `.webp` を推奨（軽量・高画質）。`.jpg` / `.png` を使う場合は `index.html` 内の該当 `src` の拡張子を変更してください。
