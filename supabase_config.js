const SUPABASE_URL = "https://vvarsaoioenxgaidsqiy.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_FwjeWZ_Szg1p0stMjSHjVA_XO6hOsnH";

// Supabaseクライアントの初期化用（CDNから読み込んだ後に実行）
let supabase;
if (typeof supabasejs !== 'undefined') {
    supabase = supabasejs.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}
