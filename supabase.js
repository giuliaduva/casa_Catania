const SUPABASE_URL = "https://wfxeybmlmuqormpwivrb.supabase.co";

const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_570nucN_b0fElV1m-uekrg_8k92CocK";

const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);