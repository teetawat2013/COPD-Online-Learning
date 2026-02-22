import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kpjcfswwelefepepulat.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtwamNmc3d3ZWxlZmVwZXB1bGF0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4MzAxMDMsImV4cCI6MjA3ODQwNjEwM30.IgyN1OrvKYQvqB6xzeWdqixL2r5bu20uqADOvW371kU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
