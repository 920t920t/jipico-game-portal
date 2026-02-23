/**
 * auth.js - Supabase Auth 連携ロジック
 */

document.addEventListener('DOMContentLoaded', () => {
    initAuth();
});

let isSignUp = false;

function initAuth() {
    const authBtn = document.getElementById('auth-btn');
    const authModal = document.getElementById('auth-modal');
    const closeAuth = document.getElementById('close-auth');
    const switchBtn = document.getElementById('switch-to-signup');
    const authSubmitBtn = document.getElementById('auth-submit-btn');
    const logoutBtn = document.getElementById('logout-btn');

    // モーダル開閉
    authBtn?.addEventListener('click', () => {
        authModal.style.display = 'flex';
    });

    closeAuth?.addEventListener('click', () => {
        authModal.style.display = 'none';
        resetAuthForm();
    });

    // ログイン/新規登録切り替え
    switchBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        toggleAuthMode();
    });

    // 送信
    authSubmitBtn?.addEventListener('click', handleAuthSubmit);

    // ログアウト
    logoutBtn?.addEventListener('click', handleLogout);

    // 認証状態の監視
    const client = typeof getDbClient === 'function' ? getDbClient() : supabase;
    if (client) {
        client.auth.onAuthStateChange((event, session) => {
            console.log("Auth State Changed:", event, session);
            updateAuthUI(session?.user || null);
        });

        // 初回チェック
        client.auth.getUser().then(({ data: { user } }) => {
            updateAuthUI(user);
        });
    }
}

function toggleAuthMode() {
    isSignUp = !isSignUp;
    const title = document.getElementById('auth-modal-title');
    const desc = document.getElementById('auth-modal-desc');
    const submitBtn = document.getElementById('auth-submit-btn');
    const switchLink = document.getElementById('switch-to-signup');

    if (isSignUp) {
        title.textContent = "新規登録";
        desc.textContent = "アカウントを作成してデータを同期しよう";
        submitBtn.textContent = "アカウント作成";
        switchLink.textContent = "ログイン";
    } else {
        title.textContent = "ログイン";
        desc.textContent = "アカウントにログインしてデータを同期しよう";
        submitBtn.textContent = "ログイン";
        switchLink.textContent = "新規登録";
    }
}

async function handleAuthSubmit() {
    const email = document.getElementById('auth-email').value;
    const password = document.getElementById('auth-password').value;
    const errorMsg = document.getElementById('auth-error-msg');

    if (!email || !password) {
        showAuthError("メールアドレスとパスワードを入力してください");
        return;
    }

    const client = typeof getDbClient === 'function' ? getDbClient() : supabase;
    if (!client) return;

    setLoading(true);

    try {
        let result;
        if (isSignUp) {
            result = await client.auth.signUp({ email, password });
        } else {
            result = await client.auth.signInWithPassword({ email, password });
        }

        if (result.error) throw result.error;

        if (isSignUp) {
            alert("登録ありがとうございます！確認メールを送信した場合は、メール内のリンクをクリックしてください。");
        }

        document.getElementById('auth-modal').style.display = 'none';
        resetAuthForm();

    } catch (err) {
        console.error("Auth Error:", err);
        showAuthError(err.message || "認証に失敗しました");
    } finally {
        setLoading(false);
    }
}

async function handleLogout() {
    const client = typeof getDbClient === 'function' ? getDbClient() : supabase;
    if (!client) return;

    try {
        const { error } = await client.auth.signOut();
        if (error) throw error;
        location.reload(); // 状態をクリアするためリロード
    } catch (err) {
        alert("ログアウト失敗: " + err.message);
    }
}

function updateAuthUI(user) {
    const authBtn = document.getElementById('auth-btn');
    const userProfile = document.getElementById('user-profile');
    const userDisplayName = document.getElementById('user-display-name');

    if (user) {
        authBtn.style.display = 'none';
        userProfile.style.display = 'flex';
        // メールアドレスの@より前を表示名とする（簡易的）
        userDisplayName.textContent = user.email.split('@')[0];
    } else {
        authBtn.style.display = 'block';
        userProfile.style.display = 'none';
    }
}

function showAuthError(msg) {
    const errorMsg = document.getElementById('auth-error-msg');
    errorMsg.textContent = msg;
    errorMsg.style.display = 'block';
}

function resetAuthForm() {
    document.getElementById('auth-email').value = '';
    document.getElementById('auth-password').value = '';
    document.getElementById('auth-error-msg').style.display = 'none';
}

function setLoading(loading) {
    const btn = document.getElementById('auth-submit-btn');
    if (loading) {
        btn.disabled = true;
        btn.textContent = "処理中...";
        btn.style.opacity = "0.7";
    } else {
        btn.disabled = false;
        btn.textContent = isSignUp ? "アカウント作成" : "ログイン";
        btn.style.opacity = "1";
    }
}
