# microwars
ブラウザで遊べる、ローグウィズデッド風の横スクロール自動進行ゲーム(ドット絵調表示)。主人公が自動で前進し、マナを消費して仲間を召喚して戦う。主人公が倒れると失敗、敵拠点を破壊するとクリア。

## 遊び方
オンラインで遊ぶ: https://mr2okama.github.io/microwars/

`docs/index.html` をブラウザで開く(または `cd docs && python3 -m http.server`)。

画面: タイトル / メニュー / ステージ選択(30面) / 図鑑 / ガチャ / パーティ編成 / キャラ強化(レベルUP・進化)。
セーブはブラウザの localStorage。`docs/data.js` は `docs/design/characters.json` と `docs/design/stages.md` から生成したデータ。

キャラクターは名前の元になった微生物(桿菌・ツリガネムシ・ミジンコ・ファージ等)を32x32のドット絵で描画(`docs/art.js`、Canvasで生成)。
