# Customer Management System

## Overview

The Beauty Parlor Management System includes a comprehensive customer management system that automatically handles customer data when appointments are booked through the customer website. The system ensures unique customer identification based on phone numbers and automatically updates customer statistics.

## Key Features

### 1. Unique Customer Identification
- **Phone Number as Unique Identifier**: Each customer is uniquely identified by their phone number
- **Automatic Duplicate Prevention**: The system prevents duplicate customer records by checking phone numbers
- **Database Constraint**: A unique constraint is enforced on the `phone` field in the customers table

### 2. Automatic Customer Data Management
When a customer books an appointment through the website:

#### For New Customers:
- Creates a new customer record with all provided information
- Sets initial values:
  - `total_visits`: 1
  - `tier`: "Bronze"
  - `loyalty_points`: 0
  - `total_spent`: 0
  - `status`: "Active"
  - `join_date`: Current date

#### For Existing Customers:
- Updates existing customer information
- Increments `total_visits` by 1
- Updates `last_visit` to current date
- Updates customer details (name, email, etc.) if provided
- Maintains existing loyalty points and tier

### 3. Loyalty System
The system includes an automated loyalty management system:

#### Loyalty Points Calculation:
- **1 point per ₹10 spent** on services
- Points are awarded when appointments are marked as "Completed"

#### Tier System:
- **Bronze**: 0-4 visits OR < ₹500 spent
- **Silver**: 5-9 visits OR ₹500-999 spent
- **Gold**: 10-19 visits OR ₹1000-1999 spent
- **Platinum**: 20+ visits OR ₹2000+ spent

#### Automatic Tier Updates:
- Tiers are automatically calculated and updated when appointments are completed
- Customers can qualify for higher tiers based on either visit count or total spending

### 4. Favorite Service Tracking
- The system automatically tracks and updates each customer's favorite service
- Favorite service is determined by the most frequently booked service
- Updated automatically when appointments are completed

## Database Schema

### Customers Table
```sql
CREATE TABLE customers (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL UNIQUE,  -- Unique constraint
    email VARCHAR(255),
    birthday DATE,
    loyalty_points INTEGER DEFAULT 0,
    total_visits INTEGER DEFAULT 0,
    last_visit DATE,
    tier VARCHAR(20) DEFAULT 'Bronze',
    favorite_service VARCHAR(255),
    total_spent DECIMAL(10,2) DEFAULT 0,
    notes TEXT,
    status VARCHAR(20) DEFAULT 'Active',
    join_date DATE DEFAULT CURRENT_DATE,
    age INTEGER,
    whatsapp VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Appointments Table
```sql
CREATE TABLE appointments (
    id BIGSERIAL PRIMARY KEY,
    customerName VARCHAR(255) NOT NULL,
    customerPhone VARCHAR(20) NOT NULL,
    customerEmail VARCHAR(255),
    service VARCHAR(255) NOT NULL,
    staff VARCHAR(255) NOT NULL,
    date VARCHAR(20) NOT NULL,
    time VARCHAR(20) NOT NULL,
    duration INTEGER DEFAULT 60,
    price DECIMAL(10,2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'Pending',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Implementation Details

### 1. Customer Data Handling Function
Located in `components/customer-website.tsx`:

```typescript
const handleCustomerData = async (customerData: {
  name: string;
  phone: string;
  email: string;
  whatsapp: string;
  age: string;
}) => {
  // Check for existing customer by phone number
  // Update existing customer or create new one
  // Handle all customer statistics automatically
}
```

### 2. Database Triggers
The system uses PostgreSQL triggers to automatically manage customer data:

#### Loyalty Points Trigger:
- Automatically calculates and awards loyalty points when appointments are completed
- Updates customer tier based on visits and spending

#### Favorite Service Trigger:
- Automatically updates customer's favorite service based on booking history

### 3. Real-time Updates
- Customer data is updated in real-time through Supabase subscriptions
- Changes are immediately reflected in the admin panel

## Usage Flow

### 1. Customer Books Appointment
1. Customer fills out booking form on website
2. System checks if customer exists by phone number
3. If new customer: Creates customer record
4. If existing customer: Updates visit count and details
5. Appointment is created and linked to customer

### 2. Admin Manages Appointments
1. Admin can view all appointments in admin panel
2. When marking appointment as "Completed":
   - Loyalty points are automatically awarded
   - Customer tier is recalculated
   - Favorite service is updated
   - Visit count and spending are updated

### 3. Customer Management
1. Admin can view all customers in the customers page
2. Customer data shows:
   - Personal information
   - Visit history
   - Loyalty points and tier
   - Favorite services
   - Total spending

## Benefits

1. **No Duplicate Customers**: Phone number uniqueness prevents duplicate records
2. **Automatic Updates**: All customer statistics are updated automatically
3. **Loyalty Management**: Automated loyalty system encourages repeat business
4. **Data Integrity**: Database constraints and triggers ensure data consistency
5. **Real-time Sync**: Changes are immediately reflected across the system

## Setup Instructions

1. **Run Database Scripts**:
   ```bash
   # Run the main table creation script
   psql -d your_database -f scripts/create-tables.sql
   
   # Run the customer triggers script
   psql -d your_database -f scripts/customer-triggers.sql
   ```

2. **Verify Setup**:
   - Check that unique constraint exists on customers.phone
   - Verify triggers are created for loyalty management
   - Test booking flow with new and existing customers

## Troubleshooting

### Common Issues:
1. **Duplicate Phone Numbers**: Ensure unique constraint is properly set
2. **Loyalty Points Not Updating**: Check that appointment status is set to "Completed"
3. **Real-time Updates Not Working**: Verify Supabase subscriptions are active

### Debugging:
- Check browser console for error messages
- Verify database triggers are active
- Monitor Supabase logs for connection issues 