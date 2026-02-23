// GAMES_DB設定はDBから取得されるようになりました。

document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const gameId = urlParams.get('id');

    if (!gameId) {
        window.location.href = 'index.html';
        return;
    }

    try {
        // DBからゲーム情報を取得
        const { data: gameData, error } = await supabase
            .from('games')
            .select('*')
            .eq('id', gameId)
            .single();

        if (error || !gameData) {
            document.getElementById('game-title').textContent = 'Game Not Found';
            document.getElementById('game-description').textContent = '指定されたゲームが見つかりません。';
            return;
        }

        renderPlayPage(gameData);
        initComments(gameId);

    } catch (err) {
        console.error('Fetch error:', err);
    }
});

function renderPlayPage(gameData) {
    // Load Game Info
    document.title = `${gameData.title} | Jipico's Game Portal`;
    document.getElementById('game-title').textContent = gameData.title;

    // アスペクト比とスケールの動的調整
    const wrapper = document.querySelector('.game-wrapper');
    const iframe = document.getElementById('game-iframe');

    const gameWidth = gameData.width || 1280;
    const gameHeight = gameData.height || 720;

    wrapper.style.aspectRatio = gameData.aspect_ratio || `${gameWidth} / ${gameHeight}`;

    function resizeIframe() {
        const wrapperRect = wrapper.getBoundingClientRect();
        // マージンを考慮して少し余裕を持たせる（100%だと境界が滲むことがあるため）
        const scale = Math.min(wrapperRect.width / gameWidth, wrapperRect.height / gameHeight);

        iframe.style.width = `${gameWidth}px`;
        iframe.style.height = `${gameHeight}px`;
        iframe.style.transformOrigin = 'center center'; // 中心基準に変更
        iframe.style.transform = `translate(-50%, -50%) scale(${scale})`;

        iframe.style.position = 'absolute';
        iframe.style.left = `50%`;
        iframe.style.top = `50%`;

        // ドット絵の鮮明さを保つ
        iframe.style.imageRendering = 'pixelated';
        iframe.style.imageRendering = 'crisp-edges';
    }

    window.addEventListener('resize', resizeIframe);
    iframe.src = gameData.src;
    iframe.onload = resizeIframe;

    document.getElementById('game-description').innerText = gameData.description;
    document.getElementById('game-controls').innerText = gameData.controls;
    document.getElementById('game-bugs').innerText = gameData.bugs;

    // screenshots (DB上は現在無いためフォールバック。JSONB等で拡張可能)
    const gallery = document.getElementById('screenshot-gallery');
    if (gameData.screenshots) {
        // ... (JSONBから読み込むロジック等)
    }
}

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
