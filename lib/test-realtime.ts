import { supabase } from './supabase'

export async function testRealtimeConnection() {
  try {
    console.log('🔍 Testing Supabase connection...')
    
    // Test basic connection
    const { data, error } = await supabase.from('services').select('count').limit(1)
    
    if (error) {
      console.error('❌ Database connection failed:', error)
      return { success: false, message: error.message }
    }
    
    console.log('✅ Database connection successful')
    
    // Test real-time subscription
    console.log('🔄 Testing real-time subscription...')
    
    const channel = supabase
      .channel('test_realtime')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'services' 
      }, (payload) => {
        console.log('📡 Real-time event received:', payload)
      })
      .subscribe((status) => {
        console.log('📊 Subscription status:', status)
      })
    
    // Clean up after 5 seconds
    setTimeout(() => {
      channel.unsubscribe()
      console.log('🧹 Test subscription cleaned up')
    }, 5000)
    
    return { success: true, message: 'Connection and real-time test initiated' }
    
  } catch (error) {
    console.error('❌ Test failed:', error)
    return { success: false, message: error.message }
  }
}

export async function addTestService() {
  try {
    const testService = {
      name: `Test Service ${Date.now()}`,
      category: 'Hair Care',
      duration: '30 min',
      price: 100,
      description: 'Test service for real-time verification',
      status: 'Active' as const
    }
    
    console.log('➕ Adding test service:', testService)
    
    const { data, error } = await supabase
      .from('services')
      .insert([testService])
      .select()
    
    if (error) {
      console.error('❌ Failed to add test service:', error)
      return { success: false, error }
    }
    
    console.log('✅ Test service added:', data)
    return { success: true, data }
    
  } catch (error) {
    console.error('❌ Test service creation failed:', error)
    return { success: false, error }
  }
}