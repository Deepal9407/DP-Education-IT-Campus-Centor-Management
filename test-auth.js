import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://filnbuefeauaygyepltg.supabase.co'
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpbG5idWVmZWF1YXlneWVwbHRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg3Mjg0MzgsImV4cCI6MjA4NDMwNDQzOH0.E8X4GgZmkizXVJBPho5LtKcubk78WRHLFLlotK3lK74'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testSignUp() {
  console.log('Attempting to sign up test user...')
  const email = `test_${Date.now()}@example.com`
  const password = 'password123'

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) {
    console.error('Sign up failed:', error.message)
    process.exit(1)
  }

  console.log('Sign up successful!')
  console.log('User ID:', data.user?.id)
  console.log('Is user confirmed?', data.user?.role) // usually 'authenticated' if confirm is off, or check confirmation status

  // Try to sign in
  console.log('Attempting to sign in...')
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (signInError) {
    if (signInError.message.includes('Email not confirmed')) {
      console.log('Sign in failed as expected (Email not confirmed). Auth connection is working!')
    } else {
      console.error('Sign in failed:', signInError.message)
    }
  } else {
    console.log('Sign in successful!')
  }
}

testSignUp()
