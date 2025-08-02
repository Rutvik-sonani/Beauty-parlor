import { supabase } from './supabase'

export async function testSupabaseConnection() {
  try {
    console.log('Testing Supabase connection...')
    
    // Test basic connection
    const { data, error } = await supabase.from('services').select('count', { count: 'exact', head: true })
    
    if (error) {
      console.error('Connection test failed:', error)
      
      if (error.code === '42P01') {
        console.log('❌ Services table does not exist')
        console.log('📝 Please run the SQL script from scripts/create-tables.sql in your Supabase dashboard')
        return { success: false, message: 'Tables not created' }
      }
      
      return { success: false, message: error.message }
    }
    
    console.log('✅ Supabase connection successful')
    console.log(`📊 Services table has ${data || 0} records`)
    
    return { success: true, count: data || 0 }
    
  } catch (error) {
    console.error('Connection test error:', error)
    return { success: false, message: error.message }
  }
}

export async function createTestService() {
  try {
    console.log('Creating test service...')
    
    const testService = {
      name: 'Test Service',
      category: 'Test',
      duration: '30 min',
      price: 500,
      description: 'This is a test service',
      status: 'Active'
    }
    
    const { data, error } = await supabase.from('services').insert([testService]).select()
    
    if (error) {
      console.error('Failed to create test service:', error)
      return { success: false, error: error.message }
    }
    
    console.log('✅ Test service created:', data)
    return { success: true, data }
    
  } catch (error) {
    console.error('Test service creation error:', error)
    return { success: false, error: error.message }
  }
}