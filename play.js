/**
 * play.js - ゲーム詳細ページの制御ロジック
 */

document.addEventListener('DOMContentLoaded', async () => {
    console.log('%c[DEBUG] play.js loaded', 'color: white; background: blue; padding: 2px 5px;');
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
            document.getElementById('game-description').textContent = '指定されたゲームが見つかりません。DBのIDを確認してください。';
            return;
        }

        console.log('[DEBUG] Current Page URL:', window.location.href);
        console.log('[DEBUG] Game ID from URL:', gameId);
        console.log('[DEBUG] Fetched Game Data (Detailed):', JSON.parse(JSON.stringify(gameData)));

        renderPlayPage(gameData);
        initComments(gameId);
        handleViewCount(gameId, gameData.view_count);

    } catch (err) {
        console.error('Fetch error:', err);
    }
});

/**
 * ゲーム情報の描画
 */
function renderPlayPage(gameData) {
    document.title = `${gameData.title} | Jipico's Game Portal`;
    document.getElementById('game-title').textContent = gameData.title;

    const wrapper = document.querySelector('.game-wrapper');
    const iframe = document.getElementById('game-iframe');

    const gameWidth = gameData.width || 1280;
    const gameHeight = gameData.height || 720;

    wrapper.style.aspectRatio = gameData.aspect_ratio || `${gameWidth} / ${gameHeight}`;

    function resizeIframe() {
        const wrapperRect = wrapper.getBoundingClientRect();
        const scale = Math.min(wrapperRect.width / gameWidth, wrapperRect.height / gameHeight);

        iframe.style.width = `${gameWidth}px`;
        iframe.style.height = `${gameHeight}px`;
        iframe.style.transformOrigin = 'center center';
        iframe.style.transform = `translate(-50%, -50%) scale(${scale})`;
        iframe.style.position = 'absolute';
        iframe.style.left = `50%`;
        iframe.style.top = `50%`;
        iframe.style.imageRendering = 'pixelated';
        iframe.style.imageRendering = 'crisp-edges';
    }

    window.addEventListener('resize', resizeIframe);

    const version = gameData.version || Date.now();
    const separator = gameData.src.includes('?') ? '&' : '?';
    iframe.src = `${gameData.src}${separator}v=${version}`;
    console.log('[DEBUG] Setting iframe src to:', iframe.src);
    console.log('[DEBUG] iframe.src absolute path:', iframe.src);
    iframe.onload = resizeIframe;

    document.getElementById('game-description').innerText = gameData.description;
    document.getElementById('game-controls').innerText = gameData.controls;
    document.getElementById('game-bugs').innerText = gameData.bugs;

    const gallery = document.getElementById('screenshot-gallery');
    gallery.innerHTML = '';
    if (gameData.screenshots && Array.isArray(gameData.screenshots)) {
        gameData.screenshots.forEach(src => {
            const img = document.createElement('img');
            img.src = src;
            img.className = 'screenshot-img';
            img.onclick = () => window.open(src, '_blank');
            gallery.appendChild(img);
        });
    }
}

/**
 * アクセスカウンターの処理
 */
async function handleViewCount(id, initialCount) {
    const viewCountEl = document.getElementById('view-count');
    if (!viewCountEl) return;

    let currentCount = initialCount || 0;
    viewCountEl.textContent = currentCount.toLocaleString();

    const sessionKey = `viewed_${id}`;
    if (!sessionStorage.getItem(sessionKey)) {
        try {
            const client = typeof getDbClient === 'function' ? getDbClient() : supabase;
            if (client) {
                const { error } = await client.rpc('increment_view_count', { p_game_id: id });
                if (!error) {
                    sessionStorage.setItem(sessionKey, 'true');
                    const { data } = await client.from('games').select('view_count').eq('id', id).single();
                    if (data) {
                        viewCountEl.textContent = data.view_count.toLocaleString();
                    }
                }
            }
        } catch (err) {
            console.error('View count error:', err);
        }
    }
}

/**
 * コメント機能の初期化
 */
async function initComments(gameId) {
    const commentsList = document.getElementById('comments-list');
    const submitBtn = document.getElementById('submit-comment');
    const nameInput = document.getElementById('comment-name');
    const textInput = document.getElementById('comment-text');

    let client = typeof getDbClient === 'function' ? getDbClient() : supabase;
    if (!client) return;

    let currentUser = null;
    try {
        const { data: { user } } = await client.auth.getUser();
        currentUser = user;
        if (currentUser && !nameInput.value) {
            nameInput.value = currentUser.email.split('@')[0];
        }
    } catch (e) { }

    const loadComments = async () => {
        try {
            const { data: comments, error } = await client
                .from('comments')
                .select('*')
                .eq('game_id', gameId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            const myTokens = JSON.parse(localStorage.getItem('comment_delete_tokens') || '{}');

            commentsList.innerHTML = '';
            if (!comments || comments.length === 0) {
                commentsList.innerHTML = '<p style="color:#888; text-align:center; padding: 2rem 0;">まだコメントはありません。</p>';
                return;
            }

            comments.forEach(c => {
                const el = document.createElement('div');
                el.className = 'comment-item';
                const isMyComment = myTokens[c.id] !== undefined;
                const dateStr = new Date(c.created_at).toLocaleString('ja-JP');
                const sanitizedText = (c.content || "").replace(/</g, "&lt;").replace(/>/g, "&gt;");
                const sanitizedName = (c.nickname || "名無しさん").replace(/</g, "&lt;").replace(/>/g, "&gt;");

                el.innerHTML = `
                    <div class="comment-header">
                        <span class="comment-name">${sanitizedName}</span>
                        <div style="display:flex; align-items:center; gap:10px;">
                            <span class="comment-date">${dateStr}</span>
                            ${isMyComment ? `<button class="delete-comment-btn" data-id="${c.id}" style="background:none; border:none; color:var(--accent-pink); cursor:pointer; font-size:0.7rem;">削除</button>` : ''}
                        </div>
                    </div>
                    <div class="comment-body">${sanitizedText}</div>
                `;

                if (isMyComment) {
                    el.querySelector('.delete-comment-btn').onclick = () => deleteComment(c.id, myTokens[c.id]);
                }
                commentsList.appendChild(el);
            });
        } catch (err) {
            console.error('Error loading comments:', err);
        }
    };

    const deleteComment = async (commentId, token) => {
        if (!confirm('削除しますか？')) return;
        try {
            const { error } = await client.from('comments').delete().eq('id', commentId).eq('delete_token', token);
            if (error) throw error;
            const myTokens = JSON.parse(localStorage.getItem('comment_delete_tokens') || '{}');
            delete myTokens[commentId];
            localStorage.setItem('comment_delete_tokens', JSON.stringify(myTokens));
            loadComments();
        } catch (err) {
            alert('削除失敗: ' + err.message);
        }
    };

    const saveComment = async () => {
        const text = textInput.value.trim();
        if (!text) return;
        const name = nameInput.value.trim() || '名無しさん';
        const deleteToken = Math.random().toString(36).substring(2) + Date.now().toString(36);

        submitBtn.disabled = true;
        try {
            const { data, error } = await client.from('comments').insert([{
                game_id: gameId,
                user_id: currentUser ? currentUser.id : null,
                nickname: name,
                content: text,
                delete_token: deleteToken
            }]).select();

            if (error) throw error;
            if (data && data[0]) {
                const myTokens = JSON.parse(localStorage.getItem('comment_delete_tokens') || '{}');
                myTokens[data[0].id] = deleteToken;
                localStorage.setItem('comment_delete_tokens', JSON.stringify(myTokens));
            }
            textInput.value = '';
            loadComments();
        } catch (err) {
            alert('送信失敗');
        } finally {
            submitBtn.disabled = false;
        }
    };

    submitBtn.onclick = saveComment;
    textInput.onkeydown = (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') saveComment();
    };

    loadComments();
}
