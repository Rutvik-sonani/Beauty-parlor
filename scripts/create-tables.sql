        -- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS data_backups CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS service_history CASCADE;
DROP TABLE IF EXISTS students CASCADE;
DROP TABLE IF EXISTS courses CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS appointments CASCADE;
DROP TABLE IF EXISTS services CASCADE;
DROP TABLE IF EXISTS staff CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS marketing_campaigns CASCADE;

-- Create customers table
CREATE TABLE customers (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL UNIQUE,
    email VARCHAR(255),
    birthday DATE,
    loyalty_points INTEGER DEFAULT 0,
    total_visits INTEGER DEFAULT 0,
    last_visit DATE,
    tier VARCHAR(20) DEFAULT 'Bronze' CHECK (tier IN ('Bronze', 'Silver', 'Gold', 'Platinum')),
    favorite_service VARCHAR(255),
    total_spent DECIMAL(10,2) DEFAULT 0,
    notes TEXT,
    status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
    join_date DATE DEFAULT CURRENT_DATE,
    age INTEGER,
    whatsapp VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create staff table
CREATE TABLE staff (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(100) NOT NULL,
    specialization TEXT[] DEFAULT '{}',
    experience VARCHAR(50),
    rating DECIMAL(3,2) DEFAULT 0,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    salary DECIMAL(10,2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
    availability TEXT,
    join_date DATE DEFAULT CURRENT_DATE,
    address TEXT,
    emergency_contact VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create services table
CREATE TABLE services (
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

-- Create appointments table with direct field names for real-time compatibility
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
    status VARCHAR(20) DEFAULT 'Pending' CHECK (status IN ('Confirmed', 'Pending', 'Cancelled', 'Completed')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create products table
CREATE TABLE products (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    price DECIMAL(10,2) NOT NULL,
    stock INTEGER DEFAULT 0,
    min_stock INTEGER DEFAULT 0,
    supplier VARCHAR(255),
    description TEXT,
    status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
    expiry_date DATE,
    last_restocked DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create courses table
CREATE TABLE courses (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    duration VARCHAR(50),
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    instructor_id BIGINT REFERENCES staff(id) ON DELETE SET NULL,
    max_students INTEGER DEFAULT 0,
    current_students INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive', 'Completed')),
    start_date DATE,
    end_date DATE,
    schedule TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create students table
CREATE TABLE students (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    course_id BIGINT REFERENCES courses(id) ON DELETE CASCADE,
    enrollment_date DATE DEFAULT CURRENT_DATE,
    payment_status VARCHAR(20) DEFAULT 'Pending' CHECK (payment_status IN ('Paid', 'Pending', 'Partial')),
    progress INTEGER DEFAULT 0,
    total_fees DECIMAL(10,2) DEFAULT 0,
    paid_amount DECIMAL(10,2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Completed', 'Dropped')),
    age INTEGER,
    whatsapp VARCHAR(20),
    address TEXT,
    emergency_contact VARCHAR(20),
    batch VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create service_history table
CREATE TABLE service_history (
    id BIGSERIAL PRIMARY KEY,
    customer_id BIGINT REFERENCES customers(id) ON DELETE CASCADE,
    appointment_id BIGINT REFERENCES appointments(id) ON DELETE SET NULL,
    services TEXT[] DEFAULT '{}',
    staff_name VARCHAR(255),
    amount DECIMAL(10,2) DEFAULT 0,
    duration VARCHAR(50),
    notes TEXT,
    date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create reviews table
CREATE TABLE reviews (
    id BIGSERIAL PRIMARY KEY,
    customer_id BIGINT REFERENCES customers(id) ON DELETE CASCADE,
    service_id BIGINT REFERENCES services(id) ON DELETE SET NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    status VARCHAR(20) DEFAULT 'Pending' CHECK (status IN ('Published', 'Pending', 'Hidden')),
    response TEXT,
    date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create data_backups table
CREATE TABLE data_backups (
    id BIGSERIAL PRIMARY KEY,
    backup_name VARCHAR(255) NOT NULL,
    backup_data JSONB NOT NULL,
    created_by VARCHAR(255) DEFAULT 'Admin',
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create marketing_campaigns table
CREATE TABLE IF NOT EXISTS marketing_campaigns (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'Draft',
    sent INTEGER DEFAULT 0,
    responses INTEGER DEFAULT 0,
    response_rate DECIMAL(5,2) DEFAULT 0.00,
    message TEXT NOT NULL,
    target_audience VARCHAR(50) NOT NULL,
    scheduled_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_tier ON customers(tier);
CREATE INDEX idx_customers_status ON customers(status);

CREATE INDEX idx_appointments_customer_name ON appointments(customerName);
CREATE INDEX idx_appointments_staff ON appointments(staff);
CREATE INDEX idx_appointments_service ON appointments(service);
CREATE INDEX idx_appointments_date ON appointments(date);
CREATE INDEX idx_appointments_status ON appointments(status);

CREATE INDEX idx_staff_status ON staff(status);
CREATE INDEX idx_services_status ON services(status);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_status ON products(status);

CREATE INDEX idx_students_course_id ON students(course_id);
CREATE INDEX idx_students_status ON students(status);

CREATE INDEX idx_service_history_customer_id ON service_history(customer_id);
CREATE INDEX idx_service_history_date ON service_history(date);

CREATE INDEX idx_reviews_customer_id ON reviews(customer_id);
CREATE INDEX idx_reviews_service_id ON reviews(service_id);
CREATE INDEX idx_reviews_status ON reviews(status);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_marketing_campaigns_status ON marketing_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_marketing_campaigns_created_at ON marketing_campaigns(created_at);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_marketing_campaigns_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_marketing_campaigns_updated_at
    BEFORE UPDATE ON marketing_campaigns
    FOR EACH ROW
    EXECUTE FUNCTION update_marketing_campaigns_updated_at();

-- Insert some sample marketing campaigns
INSERT INTO marketing_campaigns (name, type, status, sent, responses, response_rate, message, target_audience) VALUES
('Welcome New Customers', 'Email', 'Active', 45, 12, 26.67, 'Welcome to our beauty parlor! Get 20% off your first visit.', 'new'),
('Birthday Special', 'SMS', 'Active', 23, 8, 34.78, 'Happy Birthday! Enjoy 15% off on any service this month.', 'birthday'),
('Loyalty Rewards', 'Email + SMS', 'Scheduled', 0, 0, 0.00, 'Thank you for being a loyal customer! Special rewards await you.', 'regular'),
('Come Back Offer', 'Email', 'Draft', 0, 0, 0.00, 'We miss you! Get 25% off on your next visit.', 'inactive');

-- Create business_settings table
CREATE TABLE IF NOT EXISTS business_settings (
    id SERIAL PRIMARY KEY,
    business_name VARCHAR(255) DEFAULT 'RBS Salon',
    business_phone VARCHAR(50) DEFAULT '+1 (555) 123-4567',
    business_address TEXT DEFAULT '123 Beauty Street, Salon City, SC 12345',
    email_notifications BOOLEAN DEFAULT true,
    sms_notifications BOOLEAN DEFAULT false,
    push_notifications BOOLEAN DEFAULT true,
    strong_passwords BOOLEAN DEFAULT true,
    two_factor_auth BOOLEAN DEFAULT false,
    session_timeout INTEGER DEFAULT 30,
    auto_backups BOOLEAN DEFAULT true,
    data_encryption BOOLEAN DEFAULT true,
    audit_logging BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create staff_accounts table
CREATE TABLE IF NOT EXISTS staff_accounts (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) DEFAULT 'Staff',
    staff_id VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    permissions JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_staff_accounts_email ON staff_accounts(email);
CREATE INDEX IF NOT EXISTS idx_staff_accounts_staff_id ON staff_accounts(staff_id);
CREATE INDEX IF NOT EXISTS idx_staff_accounts_is_active ON staff_accounts(is_active);

-- Add triggers to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_business_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_staff_accounts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_business_settings_updated_at
    BEFORE UPDATE ON business_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_business_settings_updated_at();

CREATE TRIGGER trigger_update_staff_accounts_updated_at
    BEFORE UPDATE ON staff_accounts
    FOR EACH ROW
    EXECUTE FUNCTION update_staff_accounts_updated_at();

-- Insert default business settings
INSERT INTO business_settings (id, business_name, business_phone, business_address) VALUES
(1, 'RBS Salon', '+1 (555) 123-4567', '123 Beauty Street, Salon City, SC 12345')
ON CONFLICT (id) DO NOTHING;

-- Insert sample staff accounts
INSERT INTO staff_accounts (name, email, role, staff_id, password, permissions) VALUES
('Admin User', 'admin@rbssalon.com', 'Manager', 'STAFF1001', 'AdminPass123', '{"canAddServices": true, "canAddCustomers": true, "canAddStudents": true, "canAddInventory": true, "canManageAppointments": true, "canViewFinancials": true, "canViewReports": true, "canManageSettings": true}'),
('Reception Staff', 'reception@rbssalon.com', 'Receptionist', 'STAFF1002', 'ReceptionPass123', '{"canAddServices": false, "canAddCustomers": true, "canAddStudents": false, "canAddInventory": false, "canManageAppointments": true, "canViewFinancials": false, "canViewReports": false, "canManageSettings": false}');

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_staff_updated_at BEFORE UPDATE ON staff FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert success message
INSERT INTO data_backups (backup_name, backup_data, created_by, description) 
VALUES ('Initial Setup', '{"message": "Database tables created successfully"}', 'System', 'Initial database setup completed');
