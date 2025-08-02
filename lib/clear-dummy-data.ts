import { supabase } from './supabase'

export async function clearDummyAppointments() {
  try {
    console.log('Clearing dummy appointments...')
    
    // Delete appointments with dummy customer names
    const { error } = await supabase
      .from('appointments')
      .delete()
      .in('customerName', ['Sarah Johnson', 'Emily Davis', 'Jessica Wilson'])
    
    if (error) {
      console.error('Error clearing dummy appointments:', error)
    } else {
      console.log('Dummy appointments cleared successfully')
    }
  } catch (error) {
    console.error('Error clearing dummy data:', error)
  }
}

export async function clearAllAppointments() {
  try {
    console.log('Clearing all appointments...')
    
    const { error } = await supabase
      .from('appointments')
      .delete()
      .neq('id', 0) // Delete all records
    
    if (error) {
      console.error('Error clearing appointments:', error)
    } else {
      console.log('All appointments cleared successfully')
    }
  } catch (error) {
    console.error('Error clearing appointments:', error)
  }
}

export async function clearAllDummyData() {
  try {
    console.log('Clearing all dummy data...')
    
    // Clear dummy appointments
    await clearDummyAppointments()
    
    // Clear dummy customers if needed
    const { error: customerError } = await supabase
      .from('customers')
      .delete()
      .or('name.eq.Sarah Johnson,name.eq.Emily Davis,name.eq.Jessica Wilson')
    
    if (customerError) {
      console.error('Error clearing dummy customers:', customerError)
    }
    
    console.log('All dummy data cleared')
  } catch (error) {
    console.error('Error clearing dummy data:', error)
  }
}