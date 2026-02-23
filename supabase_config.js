const SUPABASE_URL = "https://vvarsaoioenxgaidsqiy.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2YXJzYW9pb2VueGdhaWRzcWl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE3ODE4ODcsImV4cCI6MjA4NzM1Nzg4N30.R5SB0GKqLNkeUhytCQ-DhQRNDVKjM8w02WBJfvGN4Qs";

// Supabaseクライアントの初期化用
let supabase;
if (typeof window.supabase !== 'undefined') {
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
} else if (typeof supabase !== 'undefined' && supabase.createClient) {
    // CDNのバージョンによってグローバル名が異なる場合への対応
    supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}
