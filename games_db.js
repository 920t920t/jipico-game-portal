const GAMES_DB = {
    'lsg': {
        title: '告白デスマーチ 修学旅行編',
        src: '13_LSG/index.html',
        thumbnail: '13_LSG/title.jpg',
        description: '4人の女子との恋愛シミュレーションゲームです。\n全員との[ハッピーエンド]を目指しましょう！',
        controls: '・マウスクリック または タッチ：選択や会話を進める',
        bugs: '＜バグ1＞\n1日が終わった時に「とじる」ボタンが押せないバグが発生\n\n＜解決策1＞\n・セーブをした状態でブラウザをリロードし、ロードする（※同じ日にちが繰り返されます）\n・または、画面を拡大（Ctrl + / Cmd +）することで押せるようになる場合があります',
        aspectRatio: '1280 / 720',
        screenshots: ['13_LSG/screenshot1.jpg', '13_LSG/screenshot2.jpg', '13_LSG/screenshot3.jpg']
    },
    'spelunker': {
        title: 'Cave Explorer',
        src: '16_spelunker/index.html',
        thumbnail: '16_spelunker/title.jpg',
        description: '深い洞窟を探検し、お化けを避けてお宝を集めるアクションゲーム。\n最深部を目指してハイスコアを獲得しよう。',
        controls: '・十字キー：移動、はしごの昇り降り\n・Xキー：マシンガン (コウモリや幽霊への攻撃)\n・上＋Xキー：フラッシュ (全体攻撃)\n・下＋Xキー：爆弾 (壁を壊す)',
        bugs: '・はしごの当たり判定が少し狭い場合があります\n・壁の中にいる状態で爆弾を使用すると不具合が起きる場合があります',
        aspectRatio: '16/9',
        width: 960,
        height: 540,
        screenshots: ['16_spelunker/screenshot1.jpg', '16_spelunker/screenshot2.jpg', '16_spelunker/screenshot3.jpg']
    },
    'risingfist': {
        title: 'ライジングフィスト',
        src: '14_risingfist/index.html',
        thumbnail: '14_risingfist/title.jpg',
        description: '迫り来る敵を倒す爽快アクションゲーム。コンボを繋げてハイスコアを狙え！',
        controls: '【移動】\nW：ジャンプ / A：左 / S：しゃがみ / D：右\n【攻撃・防御】\nU：弱パンチ / I：強パンチ / J：弱キック / K：強キック / H：ガード\n【特殊】\nSpace：スーパーアーツ / O：必殺技1 / L：必殺技2\nEnter：決定 / Esc：ポーズ',
        bugs: '特になし',
        aspectRatio: '16/9',
        width: 960,
        height: 540,
        screenshots: ['14_risingfist/screenshot1.jpg', '14_risingfist/screenshot2.jpg', '14_risingfist/screenshot3.jpg']
    }
};
