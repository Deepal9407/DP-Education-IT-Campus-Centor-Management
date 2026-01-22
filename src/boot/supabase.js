import { createClient } from '@supabase/supabase-js'
import { boot } from 'quasar/wrappers'

console.log('Initializing Supabase...')

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

let supabase = null

if (supabaseUrl && supabaseAnonKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey)
    console.log('Supabase client initialized.')
  } catch (e) {
    console.error('Failed to initialize Supabase client:', e)
  }
} else {
  console.error('Supabase env variables missing!', { supabaseUrl, supabaseAnonKey })
}

export default boot(({ app }) => {
  if (supabase) {
    app.config.globalProperties.$supabase = supabase
    app.provide('supabase', supabase)
  } else {
    console.warn('Supabase not provided to app due to missing config.')
  }
})

export { supabase }
