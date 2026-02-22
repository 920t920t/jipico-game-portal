document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.game-card');

    // Add a subtle 3D tilt effect on hover for the game cards
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = ((y - centerY) / centerY) * -10;
            const rotateY = ((x - centerX) / centerX) * 10;
            
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
        });
    });

    // Login button placeholder alert
    const loginBtn = document.querySelector('.login-btn');
    if(loginBtn) {
        loginBtn.addEventListener('click', () => {
            alert('ログイン機能やランキングシステムは、今後バックエンド（FirebaseやSupabase、またはVercel Functionsなど）と連携して実装予定です！');
        });
    }
});
