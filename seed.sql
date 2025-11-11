-- Delete existing data
DELETE FROM "Notification";
DELETE FROM "Message";
DELETE FROM "Commission";
DELETE FROM "Bill";
DELETE FROM "Pickup";
DELETE FROM "User";

-- Insert Users with hashed password for 'demo123'
-- Hash: $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy

INSERT INTO "User" (id, email, password, name, phone, address, role, "isActive", "referralCode", "createdAt", "updatedAt") VALUES
('admin-001', 'admin@jelantahgo.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Admin JelantahGO', '081234567890', 'Jakarta Pusat', 'ADMIN', true, 'ADMIN001', NOW(), NOW()),
('customer-001', 'customer1@jelantahgo.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Budi Santoso', '081234567891', 'Jl. Kebon Jeruk No. 12, Jakarta Barat', 'CUSTOMER', true, 'CUST001', NOW(), NOW()),
('customer-002', 'customer2@jelantahgo.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Siti Aminah', '081234567892', 'Jl. Melati No. 45, Jakarta Selatan', 'CUSTOMER', true, 'CUST002', NOW(), NOW()),
('courier-001', 'courier@jelantahgo.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Andi Wijaya', '081234567893', 'Jakarta Barat', 'COURIER', true, 'COUR001', NOW(), NOW()),
('courier-002', 'courier2@jelantahgo.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Budi Pratama', '081234567894', 'Jakarta Timur', 'COURIER', true, 'COUR002', NOW(), NOW()),
('warehouse-001', 'warehouse@jelantahgo.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Warehouse Manager', '081234567895', 'Gudang Pusat Jakarta', 'WAREHOUSE', true, 'WARE001', NOW(), NOW());

-- Insert sample pickups
INSERT INTO "Pickup" (id, "customerId", "courierId", status, "scheduledDate", "actualDate", volume, "pricePerLiter", "totalPrice", "courierFee", "affiliateFee", latitude, longitude, "createdAt", "updatedAt") VALUES
('pickup-001', 'customer-001', 'courier-001', 'COMPLETED', '2024-01-10 10:00:00', '2024-01-10 10:30:00', 25, 5000, 125000, 25000, 0, -6.200000, 106.816666, NOW(), NOW()),
('pickup-002', 'customer-002', 'courier-001', 'PENDING', '2024-01-15 14:00:00', NULL, 30, 5000, 150000, 30000, 0, -6.200000, 106.816666, NOW(), NOW());

SELECT 'Seed completed successfully!' as status;
