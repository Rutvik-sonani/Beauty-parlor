import { supabase } from './supabase'

export async function initializeDatabase() {
  try {
    // Check if services table exists by trying to select from it
    const { data, error } = await supabase.from('services').select('id').limit(1)
    
    if (error && error.code === '42P01') {
      // Table doesn't exist, need to create tables
      console.log('Database tables not found. Please run the create-tables.sql script in your Supabase dashboard.')
      return false
    }
    
    return true
  } catch (error) {
    console.error('Error checking database:', error)
    return false
  }
}

export async function seedInitialData() {
  try {
    // Check if we already have services
    const { data: existingServices } = await supabase.from('services').select('id').limit(1)
    
    if (existingServices && existingServices.length > 0) {
      console.log('Database already has data')
      return
    }

    // Add some initial services
    const initialServices = [
      {
        name: 'Hair Cut & Style',
        category: 'Hair Care',
        duration: '60 min',
        price: 1200,
        description: 'Professional hair cutting and styling with latest trends and techniques',
        status: 'Active'
      },
      {
        name: 'Facial Treatment',
        category: 'Skin Care',
        duration: '90 min',
        price: 1800,
        description: 'Deep cleansing facial with organic products for glowing skin',
        status: 'Active'
      },
      {
        name: 'Manicure & Pedicure',
        category: 'Nail Care',
        duration: '75 min',
        price: 1000,
        description: 'Complete nail care with premium polish and nail art',
        status: 'Active'
      }
    ]

    const { error } = await supabase.from('services').insert(initialServices)
    
    if (error) {
      console.error('Error seeding initial data:', error)
    } else {
      console.log('Initial data seeded successfully')
    }
  } catch (error) {
    console.error('Error seeding data:', error)
  }
}