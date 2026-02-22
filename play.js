const GAMES_DB = {
    'lsg': {
        title: '告白デスマーチ 修学旅行編',
        src: '13_LSG/index.html',
        description: '4人の女子との恋愛シミュレーションゲームです。\n全員との[ハッピーエンド]を目指しましょう！',
        controls: '・マウスクリック または タッチ：選択や会話を進める',
        bugs: '＜バグ1＞\n1日が終わった時に「とじる」ボタンが押せないバグが発生\n\n＜解決策1＞\n・セーブをした状態でブラウザをリロードし、ロードする（※同じ日にちが繰り返されます）\n・または、画面を拡大（Ctrl + / Cmd +）することで押せるようになる場合があります',
        aspectRatio: '1280 / 720'
    },
    'spelunker': {
        title: 'Spelunker Adventure',
        src: '16_spelunker/index.html',
        description: '深い洞窟を探検し、お化けを避けてお宝を集めるアクションゲーム。\n最深部を目指してハイスコアを獲得しよう。',
        controls: '・十字キー：移動、はしごの昇り降り\n・Xキー：マシンガン (コウモリや幽霊への攻撃)\n・上＋Xキー：フラッシュ (全体攻撃)\n・下＋Xキー：爆弾 (壁を壊す)',
        bugs: '・はしごの当たり判定が少し狭い場合があります\n・壁の中にいる状態で爆弾を使用すると不具合が起きる場合があります',
        aspectRatio: '4/3' /* Spelunkerは少し縦横比が違う可能性があるため設定を持たせる */
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const gameId = urlParams.get('id');

    const gameData = GAMES_DB[gameId];

    if (!gameData) {
        document.getElementById('game-title').textContent = 'Game Not Found';
        document.getElementById('game-description').textContent = '指定されたゲームが見つかりません。URLを直接変更した可能性があります。ホームに戻って再度選択してください。';
        return;
    }

    // Load Game Info
    document.title = `${gameData.title} | My Game Portal`;
    document.getElementById('game-title').textContent = gameData.title;

    // アスペクト比とスケールの動的調整
    const wrapper = document.querySelector('.game-wrapper');
    const iframe = document.getElementById('game-iframe');

    // ゲーム描画サイズ（LSGなどは1280x720固定の可能性があるため）
    const gameWidth = gameData.width || 1280;
    const gameHeight = gameData.height || 720;

    if (gameData.aspectRatio) {
        wrapper.style.aspectRatio = gameData.aspectRatio;
    } else {
        wrapper.style.aspectRatio = `${gameWidth} / ${gameHeight}`;
    }

    // ウィンドウサイズ変更時にiframeをスケールさせて中央にフィットさせる
    function resizeIframe() {
        const wrapperRect = wrapper.getBoundingClientRect();
        const scale = Math.min(
            wrapperRect.width / gameWidth,
            wrapperRect.height / gameHeight
        );

        // iframe自体のサイズを固定解像度に設定し、CSS transformで縮小・拡大する
        iframe.style.width = `${gameWidth}px`;
        iframe.style.height = `${gameHeight}px`;
        iframe.style.transformOrigin = 'top left';
        iframe.style.transform = `scale(${scale})`;

        // ラッパー内で余白を均等にして中央配置とするため、左上の起点を計算
        const scaledWidth = gameWidth * scale;
        const scaledHeight = gameHeight * scale;
        const leftOffset = (wrapperRect.width - scaledWidth) / 2;
        const topOffset = (wrapperRect.height - scaledHeight) / 2;

        iframe.style.position = 'absolute';
        iframe.style.left = `${leftOffset}px`;
        iframe.style.top = `${topOffset}px`;
    }

    window.addEventListener('resize', resizeIframe);

    iframe.src = gameData.src;
    iframe.onload = resizeIframe; // ロード完了時にも計算を実行

    document.getElementById('game-description').innerText = gameData.description;
    document.getElementById('game-controls').innerText = gameData.controls;
    document.getElementById('game-bugs').innerText = gameData.bugs;

    // Initialize Comments
    initComments(gameId);

    // Adjust iframe size slightly depending on screen width (optional, basic responsiveness is done in CSS)
});

function initComments(gameId) {
    // 開発段階のため、まずはlocalStorageを使ってブラウザ保存で実装
    const storageKey = `comments_${gameId}`;
    const commentsList = document.getElementById('comments-list');
    const submitBtn = document.getElementById('submit-comment');
    const nameInput = document.getElementById('comment-name');
    const textInput = document.getElementById('comment-text');

    const loadComments = () => {
        const saved = localStorage.getItem(storageKey);
        const comments = saved ? JSON.parse(saved) : [];

        commentsList.innerHTML = '';
        if (comments.length === 0) {
            commentsList.innerHTML = '<p style="color:#888; text-align:center; padding: 2rem 0;">まだコメントはありません。一番乗りで感想を書こう！</p>';
            return;
        }

        // 新しいコメントが上に来るように表示
        comments.slice().reverse().forEach(c => {
            const el = document.createElement('div');
            el.className = 'comment-item';

            const dateStr = new Date(c.date).toLocaleString('ja-JP');
            // XSS対策の簡易的なエスケープ
            const sanitizedText = c.text.replace(/</g, "&lt;").replace(/>/g, "&gt;");
            const sanitizedName = c.name.replace(/</g, "&lt;").replace(/>/g, "&gt;");

            el.innerHTML = `
                <div class="comment-header">
                    <span class="comment-name">${sanitizedName}</span>
                    <span class="comment-date">${dateStr}</span>
                </div>
                <div class="comment-body">${sanitizedText}</div>
            `;
            commentsList.appendChild(el);
        });
    };

    const saveComment = () => {
        const text = textInput.value.trim();
        if (!text) {
            alert('コメントを入力してください。');
            return;
        }

        const name = nameInput.value.trim() || '名無しさん';

        const saved = localStorage.getItem(storageKey);
        const comments = saved ? JSON.parse(saved) : [];

        comments.push({
            name: name,
            text: text,
            date: new Date().toISOString()
        });

        localStorage.setItem(storageKey, JSON.stringify(comments));

        // 入力欄をクリア
        textInput.value = '';

        loadComments();
    };

    submitBtn.addEventListener('click', saveComment);

    // Ctrl+Enter or Cmd+Enter to submit
    textInput.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            saveComment();
        }
    });

    loadComments();
}
