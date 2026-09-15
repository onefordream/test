# 画像アセット

LP（`index.html`）が参照している画像ファイルです。同名のファイルをここに配置すると、
自動的にプレースホルダー表示から実画像に切り替わります（コード変更は不要）。

| ファイル名 | 用途 | 推奨比率 |
|---|---|---|
| `speed-stick-hero.webp` | ファーストビュー背景 | 横長 |
| `speed-stick-hero-product.png` | ヒーロー右上の商品ビジュアル（右からスライドイン） | 縦長（対角配置される斜めの商品写真） |
| `pain-visual.jpg` | 「あと10ヤード、飛ばしたい。」セクションの背景ビジュアル（スイングフォーム写真） | 縦長画像の上部が表示されます（`object-position: 50% 12%`） |
| `speed-stick-product.webp` | 商品ビジュアル／購入セクション | 4:5 〜 16:10 |
| `taku-profile.webp` | プロゴルファー影山拓真プロフィール写真 | 3:4（縦） |
| `speed-stick-video-poster.webp` | 使用動画のサムネイル | 16:9 |
| `speed-stick-detail-01.webp` / `speed-stick-detail-02.webp` | 商品ディテール写真 | 4:5 |
| `speed-stick-training.webp` | 使用シーン写真 | 4:5 |
| `speed-stick-og.webp` | SNSシェア用OGP画像 | 1200x630 |

形式は `.webp` を推奨（軽量・高画質）。`.jpg` / `.png` を使う場合は `index.html` 内の該当 `src` の拡張子を変更してください。
