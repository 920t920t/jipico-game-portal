/**
 * ==========================================
 * ゲーム表示順序の設定（ここを編集して順番を変えられます）
 * ==========================================
 */
const GALLERY_ORDER = ['spelunker', 'lsg', 'risingfist'];

document.addEventListener('DOMContentLoaded', () => {
    // 1. ゲームギャラリーの動的生成
    renderGameGallery();

    // 2. 既存のインタラクション（マウスホバー）
    initInteractions();

    // 3. ログインボタン
    initLoginBtn();
});

function renderGameGallery() {
    const gridContainer = document.getElementById('magazine-grid');
    if (!gridContainer) return;

    // 清掃
    gridContainer.innerHTML = '';

    if (!GALLERY_ORDER || GALLERY_ORDER.length === 0) {
        gridContainer.innerHTML = '<p>表示可能なゲームがありません。</p>';
        return;
    }

    // 最初の一つを「特集（マガジン・フィーチャー）」にする
    const featuredId = GALLERY_ORDER[0];
    const featuredData = GAMES_DB[featuredId];

    if (featuredData) {
        const featureHtml = `
            <div class="magazine-feature">
                <a href="play.html?id=${featuredId}" class="feature-link">
                    <div class="feature-img" style="background-image: url('${featuredData.thumbnail}'); background-size: cover; background-position: center;">
                        <div class="img-overlay"></div>
                    </div>
                    <div class="feature-info">
                        <span class="tag">FEATURED</span>
                        <h3>${featuredData.title}</h3>
                        <p>${featuredData.description.replace(/\n/g, '<br>')}</p>
                        <span class="action-text">PLAY NOW →</span>
                    </div>
                </a>
            </div>
        `;
        gridContainer.innerHTML += featureHtml;
    }

    // 2つ目以降を「サイドリスト」として生成
    if (GALLERY_ORDER.length > 1) {
        const sideContainer = document.createElement('div');
        sideContainer.className = 'magazine-side';

        for (let i = 1; i < GALLERY_ORDER.length; i++) {
            const gameId = GALLERY_ORDER[i];
            const data = GAMES_DB[gameId];
            if (!data) continue;

            const sideItemHtml = `
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
            sideContainer.innerHTML += sideItemHtml;
        }

        // 最後に "More Coming Soon" を追加
        sideContainer.innerHTML += `
            <div class="side-more">
                <p>More Coming Soon...</p>
            </div>
        `;
        gridContainer.appendChild(sideContainer);
    }
}

function initInteractions() {
    // 動的に生成されるため、生成後に要素を取得する必要がある
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
            alert('ログイン機能やランキングシステムは、今後バックエンド（FirebaseやSupabase等）と連携して実装予定です！');
        });
    }
}
