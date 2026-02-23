// Supabase接続情報の定義
const SUPABASE_URL = "https://vvarsaoioenxgaidsqiy.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2YXJzYW9pb2VueGdhaWRzcWl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE3ODE4ODcsImV4cCI6MjA4NzM1Nzg4N30.R5SB0GKqLNkeUhytCQ-DhQRNDVKjM8w02WBJfvGN4Qs";

// Supabaseクライアントのインスタンス
let supabase;

(function () {
    // CDNがロードされた後に実行されるのを確実にする
    const init = () => {
        if (window.supabase && window.supabase.createClient) {
            supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        }
    };

    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        init();
    } else {
        window.addEventListener('DOMContentLoaded', init);
    }
})();
