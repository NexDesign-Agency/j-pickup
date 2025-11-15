-- Update all users to use the same working password hash
-- Password: demo123
UPDATE "User" 
SET password = '$2a$10$uF1QYjx5moebIk3w4/UuS.DmUHfGF7XREBmBN.6Efc3bjhgVQCaw2'
WHERE email IN (
  'customer1@jelantahgo.com',
  'customer2@jelantahgo.com',
  'courier@jelantahgo.com',
  'courier2@jelantahgo.com',
  'warehouse@jelantahgo.com'
);

-- Verify update
SELECT email, role, 
  CASE WHEN password = '$2a$10$uF1QYjx5moebIk3w4/UuS.DmUHfGF7XREBmBN.6Efc3bjhgVQCaw2' 
    THEN 'Password Updated' 
    ELSE 'Old Password' 
  END as status
FROM "User"
ORDER BY role, email;
