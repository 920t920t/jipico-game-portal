const SUPABASE_URL = "https://vvarsaoioenxgaidsqiy.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_FwjeWZ_Szg1p0stMjSHjVA_XO6hOsnH";

// Supabaseクライアントの初期化用
let supabase;
if (typeof window.supabase !== 'undefined') {
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
} else if (typeof supabase !== 'undefined' && supabase.createClient) {
    // CDNのバージョンによってグローバル名が異なる場合への対応
    supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}
