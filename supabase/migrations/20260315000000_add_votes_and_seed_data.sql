-- Add votes table for community verification
CREATE TABLE IF NOT EXISTS votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  vote_type VARCHAR(20) NOT NULL, -- 'confirm' or 'deny'
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit votes"
ON votes FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Anyone can view votes"
ON votes FOR SELECT
TO anon, authenticated
USING (true);

CREATE INDEX IF NOT EXISTS idx_votes_restaurant ON votes(restaurant_id);

-- Add upvotes/downvotes columns to restaurants for quick counts
ALTER TABLE restaurants
ADD COLUMN IF NOT EXISTS upvotes INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS downvotes INTEGER DEFAULT 0;

-- Seed data: Real Budapest locations with free toilet access
-- These are real restaurants, cafes, malls, and public spaces in Budapest

INSERT INTO restaurants (name, address, latitude, longitude, has_toilet, toilet_code, toilet_notes, toilet_direction, toilet_status, opening_hours, amenities, verified, rating, rating_count, upvotes, downvotes)
VALUES
  -- District V (Belvaros-Lipotvaros - City Center)
  ('McDonald''s - Westend City Center', 'Vaci ut 1-3, Budapest 1062', 47.5133, 19.0553, true, NULL, 'Free for customers. Large clean restroom on the ground floor.', 'straight', 'working', '06:00-00:00', '{"wheelchair_accessible": true, "baby_changing": true, "free": true, "gender_neutral": false, "requires_purchase": false}', true, 4.0, 12, 45, 2),

  ('Burger King - Deak Ferenc ter', 'Deak Ferenc ter 3, Budapest 1052', 47.4974, 19.0530, true, NULL, 'Downstairs, free for customers. Usually clean.', 'downstairs', 'working', '08:00-23:00', '{"wheelchair_accessible": false, "baby_changing": false, "free": true, "gender_neutral": false, "requires_purchase": false}', true, 3.5, 8, 30, 5),

  ('Starbucks - Vaci utca', 'Vaci utca 16, Budapest 1052', 47.4948, 19.0536, true, 'Ask at counter', 'Ask staff for the code. Clean and modern.', 'upstairs', 'working', '07:00-22:00', '{"wheelchair_accessible": false, "baby_changing": false, "free": true, "gender_neutral": true, "requires_purchase": false}', true, 4.2, 15, 38, 3),

  ('Central Market Hall (Nagyvasarcsarnok)', 'Vamhaz krt. 1-3, Budapest 1093', 47.4872, 19.0581, true, NULL, 'Public toilets on the upper floor. Small fee for non-customers of the food court.', 'upstairs', 'working', '06:00-18:00 (Mon-Sat)', '{"wheelchair_accessible": true, "baby_changing": true, "free": false, "gender_neutral": false, "requires_purchase": false}', true, 3.8, 22, 55, 8),

  ('WestEnd City Center Mall', 'Vaci ut 1-3, Budapest 1062', 47.5138, 19.0558, true, NULL, 'Free public restrooms on every floor. Well maintained.', 'straight', 'working', '10:00-21:00', '{"wheelchair_accessible": true, "baby_changing": true, "free": true, "gender_neutral": false, "requires_purchase": false}', true, 4.5, 30, 78, 3),

  -- District VI-VII (Terezvaros - Erzsebetvaros)
  ('McDonald''s - Oktogon', 'Terez krt. 19, Budapest 1067', 47.5052, 19.0630, true, NULL, 'Clean restrooms, free for anyone. Ground floor at the back.', 'straight', 'working', '06:00-02:00', '{"wheelchair_accessible": true, "baby_changing": false, "free": true, "gender_neutral": false, "requires_purchase": false}', true, 3.8, 10, 35, 4),

  ('Szimpla Kert', 'Kazinczy u. 14, Budapest 1075', 47.4968, 19.0637, true, NULL, 'Famous ruin bar. Toilets are free during opening hours. Can be crowded.', 'basement', 'working', '12:00-04:00', '{"wheelchair_accessible": false, "baby_changing": false, "free": true, "gender_neutral": false, "requires_purchase": false}', true, 3.2, 18, 25, 10),

  ('Arena Plaza Mall', 'Kerepesi ut 9, Budapest 1087', 47.5017, 19.0838, true, NULL, 'Large modern restrooms on each floor. Free and very clean.', 'straight', 'working', '10:00-21:00', '{"wheelchair_accessible": true, "baby_changing": true, "free": true, "gender_neutral": false, "requires_purchase": false}', true, 4.3, 25, 60, 2),

  -- District I (Budavar - Castle District)
  ('Matthias Church Visitor Center', 'Szentharomsag ter 2, Budapest 1014', 47.5020, 19.0345, true, NULL, 'Public toilet near the church entrance. Clean. Small fee.', 'left', 'working', '09:00-17:00', '{"wheelchair_accessible": true, "baby_changing": false, "free": false, "gender_neutral": false, "requires_purchase": false}', true, 3.5, 7, 20, 5),

  ('Fisherman''s Bastion Cafe', 'Szentharomsag ter 5, Budapest 1014', 47.5022, 19.0347, true, NULL, 'Free for cafe customers. Beautiful location. Ask staff for access.', 'right', 'working', '09:00-20:00', '{"wheelchair_accessible": false, "baby_changing": false, "free": true, "gender_neutral": false, "requires_purchase": true}', false, 4.0, 5, 15, 3),

  -- District XI (Ujbuda)
  ('Allee Shopping Center', 'Oktober huszonharmadika u. 8-10, Budapest 1117', 47.4737, 19.0509, true, NULL, 'Modern restrooms on every floor. Very well maintained.', 'straight', 'working', '10:00-21:00', '{"wheelchair_accessible": true, "baby_changing": true, "free": true, "gender_neutral": false, "requires_purchase": false}', true, 4.6, 20, 50, 1),

  ('McDonald''s - Moricz Zsigmond korter', 'Moricz Zsigmond korter 2, Budapest 1114', 47.4744, 19.0440, true, NULL, 'Ground floor restroom. Free for everyone.', 'right', 'working', '06:00-00:00', '{"wheelchair_accessible": true, "baby_changing": false, "free": true, "gender_neutral": false, "requires_purchase": false}', true, 3.7, 6, 18, 3),

  -- District XIII (Ujlipotvaros)
  ('Duna Plaza', 'Vaci ut 178, Budapest 1138', 47.5403, 19.0752, true, NULL, 'Free public restrooms available on ground floor near food court.', 'left', 'working', '10:00-20:00', '{"wheelchair_accessible": true, "baby_changing": true, "free": true, "gender_neutral": false, "requires_purchase": false}', true, 4.0, 11, 30, 4),

  ('Lehel Market Hall', 'Vaci ut 9-15, Budapest 1134', 47.5165, 19.0599, true, '200 HUF', 'Public toilet on ground level. Coin-operated entry. Clean.', 'basement', 'working', '06:00-18:00', '{"wheelchair_accessible": true, "baby_changing": false, "free": false, "gender_neutral": false, "requires_purchase": false}', true, 3.3, 9, 22, 6),

  -- District XIV (Zuglo)
  ('KFC - Keleti Station', 'Baross ter 1, Budapest 1077', 47.5002, 19.0836, true, NULL, 'Inside the station area. Free restroom for KFC customers.', 'left', 'working', '07:00-23:00', '{"wheelchair_accessible": false, "baby_changing": false, "free": true, "gender_neutral": false, "requires_purchase": false}', true, 3.0, 14, 20, 12),

  ('Varosliget (City Park) - Public Toilet', 'Allatkerti krt. 6, Budapest 1146', 47.5149, 19.0838, true, '200 HUF', 'Public standalone toilet near the boating lake. Coin operated.', 'straight', 'working', '08:00-20:00', '{"wheelchair_accessible": true, "baby_changing": false, "free": false, "gender_neutral": false, "requires_purchase": false}', true, 2.8, 16, 15, 10),

  -- District II (Buda Hills area)
  ('Mammut Shopping Center', 'Lovohaz u. 2-6, Budapest 1024', 47.5087, 19.0271, true, NULL, 'Large clean restrooms on each level. Completely free.', 'upstairs', 'working', '10:00-21:00', '{"wheelchair_accessible": true, "baby_changing": true, "free": true, "gender_neutral": false, "requires_purchase": false}', true, 4.4, 18, 55, 2),

  ('Margit-sziget (Margaret Island) - North', 'Margit-sziget, Budapest 1138', 47.5305, 19.0490, true, '200 HUF', 'Public toilet near the Musical Fountain. Seasonal hours.', 'straight', 'working', '08:00-22:00 (Summer)', '{"wheelchair_accessible": true, "baby_changing": false, "free": false, "gender_neutral": false, "requires_purchase": false}', false, 3.0, 8, 12, 7),

  -- District IX (Ferencvaros)
  ('KFC - Corvin Quarter', 'Futó utca 37, Budapest 1082', 47.4903, 19.0705, true, NULL, 'Free restroom for customers. On the ground floor.', 'right', 'working', '08:00-23:00', '{"wheelchair_accessible": false, "baby_changing": false, "free": true, "gender_neutral": false, "requires_purchase": false}', true, 3.5, 7, 18, 5),

  ('Corvin Plaza', 'Blaha Lujza ter 1-2, Budapest 1085', 47.4955, 19.0702, true, NULL, 'Public restrooms on the 2nd floor near the food court.', 'upstairs', 'working', '10:00-21:00', '{"wheelchair_accessible": true, "baby_changing": true, "free": true, "gender_neutral": false, "requires_purchase": false}', true, 4.1, 13, 40, 3),

  -- More Central Locations
  ('Keleti Railway Station - Main Hall', 'Baross ter, Budapest 1087', 47.5002, 19.0838, true, '300 HUF', 'Paid public toilet in the main hall. Attended and clean.', 'straight', 'working', '05:00-23:00', '{"wheelchair_accessible": true, "baby_changing": false, "free": false, "gender_neutral": false, "requires_purchase": false}', true, 3.2, 20, 28, 12),

  ('Deli Railway Station', 'Krisztina krt. 37, Budapest 1013', 47.4968, 19.0253, true, '250 HUF', 'Paid restroom near platform area. Basic but functional.', 'left', 'working', '05:00-22:00', '{"wheelchair_accessible": true, "baby_changing": false, "free": false, "gender_neutral": false, "requires_purchase": false}', true, 2.5, 11, 10, 8),

  ('Nyugati Railway Station', 'Terez krt. 55, Budapest 1062', 47.5099, 19.0566, true, '300 HUF', 'Paid public toilet near the entrance. Recently renovated.', 'right', 'working', '05:00-23:00', '{"wheelchair_accessible": true, "baby_changing": true, "free": false, "gender_neutral": false, "requires_purchase": false}', true, 3.8, 15, 35, 5),

  ('MOL Bubi Station - Erzsebet ter', 'Erzsebet ter, Budapest 1051', 47.4961, 19.0518, true, NULL, 'Underground public toilet at Erzsebet ter. Recently renovated. Free!', 'downstairs', 'working', '06:00-22:00', '{"wheelchair_accessible": true, "baby_changing": false, "free": true, "gender_neutral": false, "requires_purchase": false}', true, 4.2, 25, 60, 4),

  ('SPAR - Rakoczi ut', 'Rakoczi ut 12, Budapest 1072', 47.4975, 19.0601, true, 'Ask cashier', 'Customer toilet available. Ask at checkout for the key.', 'left', 'working', '06:00-22:00', '{"wheelchair_accessible": false, "baby_changing": false, "free": true, "gender_neutral": true, "requires_purchase": true}', false, 3.0, 4, 8, 4),

  -- Buda Side - More locations
  ('MOM Park Shopping Center', 'Alkotas u. 53, Budapest 1123', 47.4876, 19.0196, true, NULL, 'Clean modern restrooms on each floor. Family-friendly.', 'upstairs', 'working', '10:00-20:00', '{"wheelchair_accessible": true, "baby_changing": true, "free": true, "gender_neutral": false, "requires_purchase": false}', true, 4.5, 14, 42, 1),

  ('Rudas Thermal Bath - Public Area', 'Dobrentei ter 9, Budapest 1013', 47.4863, 19.0417, true, NULL, 'Public restroom in the entrance area. Free before ticket purchase.', 'left', 'working', '06:00-20:00', '{"wheelchair_accessible": true, "baby_changing": false, "free": true, "gender_neutral": false, "requires_purchase": false}', false, 3.8, 6, 15, 3),

  ('Vaci utca Public Toilet', 'Vaci utca 62, Budapest 1056', 47.4905, 19.0545, true, '300 HUF', 'Underground public restroom on the walking street. Attended, clean.', 'downstairs', 'working', '07:00-21:00', '{"wheelchair_accessible": true, "baby_changing": true, "free": false, "gender_neutral": false, "requires_purchase": false}', true, 3.9, 28, 50, 8),

  ('Cafe Gerbeaud', 'Vorosmarty ter 7-8, Budapest 1051', 47.4962, 19.0498, true, 'Ask waiter', 'Historic cafe. Restroom for customers only. Very elegant.', 'downstairs', 'working', '09:00-21:00', '{"wheelchair_accessible": false, "baby_changing": false, "free": true, "gender_neutral": false, "requires_purchase": true}', true, 4.5, 10, 32, 2),

  ('Astoria Metro Station', 'Astoria, Budapest 1053', 47.4933, 19.0590, true, '250 HUF', 'Paid toilet inside the metro station. Clean and attended.', 'downstairs', 'working', '05:30-23:00', '{"wheelchair_accessible": false, "baby_changing": false, "free": false, "gender_neutral": false, "requires_purchase": false}', true, 3.0, 9, 15, 7);
