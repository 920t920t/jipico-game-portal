// Supabase接続設定
const SUPABASE_URL = "https://vvarsaoioenxgaidsqiy.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2YXJzYW9pb2VueGdhaWRzcWl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE3ODE4ODcsImV4cCI6MjA4NzM1Nzg4N30.R5SB0GKqLNkeUhytCQ-DhQRNDVKjM8w02WBJfvGN4Qs";

/**
 * 確実にSupabaseクライアントを取得するためのグローバル関数
 */
function getDbClient() {
    // CDN版のライブラリは通常 window.supabase に展開されます
    const sb = window.supabase;
    if (!sb || !sb.createClient) {
        console.error("Supabase SDK not loaded properly.");
        return null;
    }
    return sb.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

// 互換性のためのグローバルインスタンス
var supabase = getDbClient();
