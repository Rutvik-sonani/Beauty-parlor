-- Insert sample staff members
INSERT INTO staff (name, role, specialization, experience, rating, phone, email, salary, availability) VALUES
('Sarah Johnson', 'Senior Beautician', ARRAY['Facial', 'Hair Styling', 'Makeup'], '5 years', 4.8, '+1234567890', 'sarah@beautyparlor.com', 45000, 'Mon-Sat 9AM-6PM'),
('Maria Garcia', 'Hair Specialist', ARRAY['Hair Cutting', 'Hair Coloring', 'Hair Treatment'], '7 years', 4.9, '+1234567891', 'maria@beautyparlor.com', 50000, 'Tue-Sun 10AM-7PM'),
('Lisa Chen', 'Nail Technician', ARRAY['Manicure', 'Pedicure', 'Nail Art'], '3 years', 4.7, '+1234567892', 'lisa@beautyparlor.com', 35000, 'Mon-Fri 9AM-5PM'),
('Emma Wilson', 'Massage Therapist', ARRAY['Body Massage', 'Face Massage', 'Aromatherapy'], '4 years', 4.6, '+1234567893', 'emma@beautyparlor.com', 40000, 'Wed-Sun 11AM-8PM');

-- Insert sample services
INSERT INTO services (name, description, price, duration, category) VALUES
('Classic Facial', 'Deep cleansing facial with moisturizing treatment', 75.00, '60 minutes', 'Facial'),
('Hair Cut & Style', 'Professional hair cutting and styling service', 45.00, '45 minutes', 'Hair'),
('Manicure', 'Complete nail care with polish application', 35.00, '30 minutes', 'Nails'),
('Full Body Massage', 'Relaxing full body massage therapy', 90.00, '90 minutes', 'Massage'),
('Hair Coloring', 'Professional hair coloring service', 120.00, '120 minutes', 'Hair'),
('Pedicure', 'Complete foot care with nail polish', 40.00, '45 minutes', 'Nails'),
('Bridal Makeup', 'Complete bridal makeup package', 200.00, '180 minutes', 'Makeup'),
('Eyebrow Threading', 'Precise eyebrow shaping service', 20.00, '15 minutes', 'Facial');

-- Insert sample customers
INSERT INTO customers (name, phone, email, birthday, loyalty_points, total_visits, tier, favorite_service, total_spent, age, whatsapp) VALUES
('Jennifer Smith', '+1234567894', 'jennifer@email.com', '1990-05-15', 150, 8, 'Silver', 'Classic Facial', 450.00, 33, '+1234567894'),
('Amanda Brown', '+1234567895', 'amanda@email.com', '1985-08-22', 300, 15, 'Gold', 'Hair Cut & Style', 780.00, 38, '+1234567895'),
('Rachel Davis', '+1234567896', 'rachel@email.com', '1992-12-10', 75, 4, 'Bronze', 'Manicure', 180.00, 31, '+1234567896'),
('Michelle Taylor', '+1234567897', 'michelle@email.com', '1988-03-18', 500, 25, 'Platinum', 'Full Body Massage', 1250.00, 35, '+1234567897'),
('Jessica Wilson', '+1234567898', 'jessica@email.com', '1995-07-25', 120, 6, 'Silver', 'Hair Coloring', 320.00, 28, '+1234567898');

-- Insert sample products
INSERT INTO products (name, category, price, stock, min_stock, supplier, description) VALUES
('Moisturizing Cream', 'Skincare', 25.99, 50, 10, 'Beauty Supply Co', 'Premium moisturizing cream for all skin types'),
('Hair Shampoo', 'Hair Care', 18.50, 75, 15, 'Hair Products Inc', 'Professional grade shampoo for damaged hair'),
('Nail Polish Set', 'Nail Care', 35.00, 30, 5, 'Nail Art Supplies', 'Set of 12 premium nail polish colors'),
('Massage Oil', 'Massage', 22.00, 40, 8, 'Wellness Products', 'Aromatherapy massage oil blend'),
('Face Mask', 'Skincare', 15.75, 60, 12, 'Beauty Supply Co', 'Hydrating face mask for dry skin');

-- Insert sample courses
INSERT INTO courses (name, duration, description, price, instructor_id, max_students, start_date, schedule) VALUES
('Basic Beauty Course', '3 months', 'Comprehensive course covering basic beauty techniques', 1200.00, 1, 20, '2024-02-01', 'Mon-Wed-Fri 10AM-2PM'),
('Advanced Hair Styling', '2 months', 'Advanced techniques in hair cutting and styling', 800.00, 2, 15, '2024-02-15', 'Tue-Thu 2PM-6PM'),
('Nail Art Certification', '1 month', 'Professional nail art and design certification', 500.00, 3, 12, '2024-03-01', 'Sat-Sun 9AM-1PM');

-- Insert sample students
INSERT INTO students (name, phone, email, course_id, payment_status, total_fees, paid_amount, age, whatsapp, batch) VALUES
('Sophie Anderson', '+1234567899', 'sophie@email.com', 1, 'Paid', 1200.00, 1200.00, 22, '+1234567899', 'Batch-A'),
('Olivia Martinez', '+1234567900', 'olivia@email.com', 1, 'Partial', 1200.00, 600.00, 24, '+1234567900', 'Batch-A'),
('Chloe Thompson', '+1234567901', 'chloe@email.com', 2, 'Paid', 800.00, 800.00, 26, '+1234567901', 'Batch-B'),
('Grace Lee', '+1234567902', 'grace@email.com', 3, 'Pending', 500.00, 0.00, 20, '+1234567902', 'Batch-C');

-- Insert sample appointments with direct field names for real-time compatibility
INSERT INTO appointments (customerName, customerPhone, service, staff, date, time, status, price, notes, duration) VALUES
('Sarah Johnson', '+1234567890', 'Classic Facial', 'Sarah Johnson', '2024-01-15', '10:00', 'Pending', 75, 'First time customer', 60),
('Emily Davis', '+1234567891', 'Hair Cut & Style', 'Maria Garcia', '2024-01-16', '14:00', 'Pending', 45, 'Regular customer', 45),
('Jessica Wilson', '+1234567892', 'Manicure', 'Lisa Chen', '2024-01-17', '11:30', 'Confirmed', 35, 'Prefers French tips', 30);

-- Update course current_students count
UPDATE courses SET current_students = (
    SELECT COUNT(*) FROM students WHERE course_id = courses.id AND status = 'Active'
);
