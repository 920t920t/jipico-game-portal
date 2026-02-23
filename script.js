/**
 * ==========================================
 * じぴこのゲームポータル - メインスクリプト (DB連携版)
 * ==========================================
 */

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Supabaseからデータを取得して描画
    await initCmsGallery();

    // 2. ログインボタン
    initLoginBtn();
});

async function initCmsGallery() {
    const gridContainer = document.getElementById('magazine-grid');
    if (!gridContainer) return;

    try {
        // 表示順序（settingsテーブル）とゲーム一覧を並行して取得
        const [settingsRes, gamesRes] = await Promise.all([
            supabase.from('settings').select('value').eq('key', 'gallery_order').single(),
            supabase.from('games').select('*')
        ]);

        if (gamesRes.error) throw gamesRes.error;

        const allGames = gamesRes.data.reduce((acc, game) => {
            acc[game.id] = game;
            return acc;
        }, {});

        const order = settingsRes.data ? settingsRes.data.value : Object.keys(allGames);

        renderGameGallery(allGames, order);
        initInteractions();

    } catch (err) {
        console.error('Data load error:', err);
        gridContainer.innerHTML = '<p style="color:red;">データの読み込みに失敗しました。SQLの設定を確認してください。</p>';
    }
}

function renderGameGallery(gamesMap, order) {
    const gridContainer = document.getElementById('magazine-grid');
    gridContainer.innerHTML = '';

    const allIds = Object.keys(gamesMap);
    // 順序リスト（order）にあるものを優先し、残りを後ろに繋げる
    const finalOrder = [...new Set([...order.filter(id => allIds.includes(id)), ...allIds])];

    if (finalOrder.length === 0) {
        gridContainer.innerHTML = '<p>表示可能なゲームがありません。</p>';
        return;
    }

    // 特集ゲーム
    const featuredId = finalOrder[0];
    const featuredRaw = gamesMap[featuredId];
    const featuredData = {
        title: featuredRaw.title || featuredRaw.タイトル || featuredId,
        description: featuredRaw.description || featuredRaw.説明 || '',
        thumbnail: featuredRaw.thumbnail || featuredRaw.サムネイル || ''
    };

    if (featuredData) {
        gridContainer.innerHTML += `
            <div class="magazine-feature">
                <a href="play.html?id=${featuredId}" class="feature-link">
                    <div class="feature-img" style="background-image: url('${featuredData.thumbnail}'); background-size: cover; background-position: center;">
                        <div class="img-overlay"></div>
                    </div>
                    <div class="feature-info">
                        <span class="tag">FEATURED</span>
                        <h3>${featuredId === 'lsg' ? '告白デスマーチ <br>修学旅行編' : featuredData.title}</h3>
                        <p>${featuredData.description.replace(/\n/g, '<br>')}</p>
                        <span class="action-text">PLAY NOW →</span>
                    </div>
                </a>
            </div>
        `;
    }

    // サイドリスト
    if (finalOrder.length > 1) {
        const sideContainer = document.createElement('div');
        sideContainer.className = 'magazine-side';

        for (let i = 1; i < finalOrder.length; i++) {
            const gameId = finalOrder[i];
            const raw = gamesMap[gameId];
            if (!raw) continue;

            const data = {
                title: raw.title || raw.タイトル || gameId,
                thumbnail: raw.thumbnail || raw.サムネイル || ''
            };

            sideContainer.innerHTML += `
                <div class="side-item">
                    <a href="play.html?id=${gameId}" class="side-link">
                        <div class="side-img" style="background-image: url('${data.thumbnail}'); background-size: cover; background-position: center;"></div>
                        <div class="side-info">
                            <h3>${data.title.replace(' ', '<br>')}</h3>
                            <span class="action-text">PLAY →</span>
                        </div>
                    </a>
                </div>
            `;
        }
        sideContainer.innerHTML += `<div class="side-more"><p>More Coming Soon...</p></div>`;
        gridContainer.appendChild(sideContainer);
    }
}

function initInteractions() {
    const cards = document.querySelectorAll('.feature-link, .side-link');
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = ((y - centerY) / centerY) * -5;
            const rotateY = ((x - centerX) / centerX) * 5;
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px)`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
        });
    });
}

function initLoginBtn() {
    const loginBtn = document.querySelector('.login-btn');
    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            window.location.href = 'admin.html';
        });
    }
}
