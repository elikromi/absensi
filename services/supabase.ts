
import { createClient } from '@supabase/supabase-js';

// GANTI DENGAN URL DAN KEY DARI PROYEK SUPABASE ANDA
// Disarankan menggunakan import.meta.env.VITE_SUPABASE_URL di production
const SUPABASE_URL = 'https://mnamgigtmjesvdctothp.supabase.co'; 
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1uYW1naWd0bWplc3ZkY3RvdGhwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1MzYzNzksImV4cCI6MjA4NjExMjM3OX0.9oNJrU9zNLlizDkACWfAEugEy2l1yQ7s6Zjqv4SJotA';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
