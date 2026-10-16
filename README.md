# microwars
ブラウザで遊べる、にゃんこ大戦争風の横スクロール防衛ゲーム。

## 遊び方
オンラインで遊ぶ: https://mr2okama.github.io/microwars/

`web/index.html` をブラウザで開く(または `cd web && python3 -m http.server`)。

画面: タイトル / メニュー / ステージ選択(30面) / 図鑑 / ガチャ / パーティ編成 / キャラ強化(レベルUP・進化)。
セーブはブラウザの localStorage。`web/data.js` は `docs/characters.json` と `docs/stages.md` から生成したデータ。
