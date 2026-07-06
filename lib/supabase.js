import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://dvzpmwgrjzebczeoagfw.supabase.co'
const supabaseKey = 'sb_publishable_6_Ts6bAaj53KD69sO7JcfQ_d0dLvCPQ'

export const supabase = createClient(supabaseUrl, supabaseKey)