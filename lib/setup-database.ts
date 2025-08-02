import { supabase } from './supabase'

export async function setupDatabase() {
  try {
    console.log('Setting up database...')
    
    // Create services table if it doesn't exist
    const { error: createError } = await supabase.rpc('create_services_table', {})
    
    if (createError && !createError.message.includes('already exists')) {
      console.error('Error creating services table:', createError)
    }
    
    // Check if services table exists and is accessible
    const { data, error } = await supabase.from('services').select('id').limit(1)
    
    if (error) {
      console.error('Services table not accessible:', error)
      // Try to create the table manually
      await createServicesTable()
    } else {
      console.log('Services table is accessible')
    }
    
    return true
  } catch (error) {
    console.error('Database setup error:', error)
    return false
  }
}

async function createServicesTable() {
  try {
    // This is a fallback - ideally tables should be created via Supabase dashboard
    console.log('Attempting to create services table...')
    
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS services (
        id BIGSERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10,2) NOT NULL,
        duration VARCHAR(50),
        category VARCHAR(100),
        status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `
    
    // Note: This won't work directly as Supabase doesn't allow DDL via client
    // Tables need to be created via Supabase dashboard or SQL editor
    console.log('Please create tables using the SQL script in scripts/create-tables.sql')
    
  } catch (error) {
    console.error('Error creating services table:', error)
  }
}

export async function seedInitialServices() {
  try {
    // Check if we already have services
    const { data: existingServices } = await supabase.from('services').select('id').limit(1)
    
    if (existingServices && existingServices.length > 0) {
      console.log('Services already exist')
      return
    }

    // Add initial services
    const initialServices = [
      {
        name: 'Hair Cut & Style',
        category: 'Hair Care',
        duration: '60 min',
        price: 1200,
        description: 'Professional hair cutting and styling with latest trends',
        status: 'Active'
      },
      {
        name: 'Facial Treatment',
        category: 'Skin Care',
        duration: '90 min',
        price: 1800,
        description: 'Deep cleansing facial with organic products',
        status: 'Active'
      },
      {
        name: 'Manicure & Pedicure',
        category: 'Nail Care',
        duration: '75 min',
        price: 1000,
        description: 'Complete nail care with premium polish',
        status: 'Active'
      }
    ]

    const { data, error } = await supabase.from('services').insert(initialServices).select()
    
    if (error) {
      console.error('Error seeding services:', error)
    } else {
      console.log('Initial services seeded:', data)
    }
  } catch (error) {
    console.error('Error seeding initial services:', error)
  }
}