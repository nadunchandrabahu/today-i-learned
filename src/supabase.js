import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://mdheqyammcdttaimkjeu.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kaGVxeWFtbWNkdHRhaW1ramV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2NzUwMTAyOTAsImV4cCI6MTk5MDU4NjI5MH0.jANawJ38EZJbgB3i1J8SqozW7VsrisYHPJq0ziB1704";
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
