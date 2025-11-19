import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://wwotrjuzpcbwlhhlyqxv.supabase.co";

const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind3b3RyanV6cGNid2xoaGx5cXh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2NDY3NzgsImV4cCI6MjA3NzIyMjc3OH0.mOCukDJioOQemoV9hiVLMuFYezF1nf3CsZyE5KlpIbo";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
