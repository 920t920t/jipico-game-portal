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

    // キャッシュ回避（キャッシュバスター）用パラメータを付与
    const version = gameData.version || Date.now();
    const separator = gameData.src.includes('?') ? '&' : '?';
    iframe.src = `${gameData.src}${separator}v=${version}`;

    iframe.onload = resizeIframe;

    document.getElementById('game-description').innerText = gameData.description;
    document.getElementById('game-controls').innerText = gameData.controls;
    document.getElementById('game-bugs').innerText = gameData.bugs;

    // screenshots
    const gallery = document.getElementById('screenshot-gallery');
    gallery.innerHTML = '';

    if (gameData.screenshots && Array.isArray(gameData.screenshots)) {
        gameData.screenshots.forEach(src => {
            const img = document.createElement('img');
            img.src = src;
            img.className = 'screenshot-img';
            img.alt = 'Screenshot';
            // クリックで拡大（簡易実装）
            img.onclick = () => window.open(src, '_blank');
            gallery.appendChild(img);
        });
    }
}

async function initComments(gameId) {
    const commentsList = document.getElementById('comments-list');
    const submitBtn = document.getElementById('submit-comment');
    const nameInput = document.getElementById('comment-name');
    const textInput = document.getElementById('comment-text');

    // Supabaseクライアントの取得を確実に
    let client = null;
    if (typeof getDbClient === 'function') {
        client = getDbClient();
    } else if (typeof supabase !== 'undefined') {
        client = supabase;
    }

    if (!client) {
        console.error("Supabase client could not be initialized.");
        commentsList.innerHTML = '<p style="color:var(--accent-pink); text-align:center;">システムの初期化に失敗しました。</p>';
        return;
    }

    // 現在のユーザー情報を取得（ログインしている場合のみ）
    let currentUser = null;
    try {
        const { data: { user } } = await client.auth.getUser();
        currentUser = user;

        // ログインしている場合は名前入力欄をメールアドレスの一部で埋める（任意）
        if (currentUser && !nameInput.value) {
            nameInput.value = currentUser.email.split('@')[0];
        }
    } catch (e) {
        console.warn("Auth check failed:", e);
    }

    const loadComments = async () => {
        try {
            const { data: comments, error } = await client
                .from('comments')
                .select('*')
                .eq('game_id', gameId)
                .order('created_at', { ascending: false });

            if (error) throw error;

            commentsList.innerHTML = '';
            if (!comments || comments.length === 0) {
                commentsList.innerHTML = '<p style="color:#888; text-align:center; padding: 2rem 0;">まだコメントはありません。一番乗りで感想を書こう！</p>';
                return;
            }

            comments.forEach(c => {
                const el = document.createElement('div');
                el.className = 'comment-item';

                const dateStr = new Date(c.created_at).toLocaleString('ja-JP');
                // XSS対策の簡易的なエスケープ
                const sanitizedText = (c.content || "").replace(/</g, "&lt;").replace(/>/g, "&gt;");
                const sanitizedName = (c.nickname || "名無しさん").replace(/</g, "&lt;").replace(/>/g, "&gt;");

                el.innerHTML = `
                    <div class="comment-header">
                        <span class="comment-name">${sanitizedName}</span>
                        <span class="comment-date">${dateStr}</span>
                    </div>
                    <div class="comment-body">${sanitizedText}</div>
                `;
                commentsList.appendChild(el);
            });
        } catch (err) {
            console.error('Error loading comments:', err);
            commentsList.innerHTML = '<p style="color:var(--accent-pink); text-align:center;">コメントの読み込みに失敗しました。</p>';
        }
    };

    const saveComment = async () => {
        const text = textInput.value.trim();
        if (!text) {
            alert('コメントを入力してください。');
            return;
        }

        const name = nameInput.value.trim() || '名無しさん';

        submitBtn.disabled = true;
        submitBtn.textContent = '送信中...';

        try {
            const { error } = await client
                .from('comments')
                .insert([
                    {
                        game_id: gameId,
                        user_id: currentUser ? currentUser.id : null,
                        nickname: name,
                        content: text
                    }
                ]);

            if (error) throw error;

            // 入力欄をクリア
            textInput.value = '';
            await loadComments();

        } catch (err) {
            console.error('Error saving comment:', err);
            alert('コメントの送信に失敗しました: ' + err.message);
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'コメントを送信';
        }
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
