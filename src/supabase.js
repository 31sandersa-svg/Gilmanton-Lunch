import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ayfdhnlddjpjdvpnegyc.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5ZmRobmxkZGpwamR2cG5lZ3ljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyNTgzNDQsImV4cCI6MjA4ODgzNDM0NH0.bd-kK0b9vpfl4JnAIUG4PsqSbpmvSImS0fAe2QUHTD0'

export const supabase = createClient(supabaseUrl, supabaseKey)