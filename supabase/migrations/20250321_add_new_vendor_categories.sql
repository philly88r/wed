-- Add new vendor categories
INSERT INTO vendor_categories (id, name, icon, description, created_at, updated_at) VALUES
  ('bb1f9b43-7c2e-4b3f-a7f1-d92f7c4c3b2e', 'CAKE/DESSERTS', 'cake', 'Wedding cakes and dessert services', now(), now()),
  ('cc2f9c44-8d3e-4c3f-a7f1-d92f7c4c3b3e', 'COUPLE ATTIRE', 'checkroom', 'Wedding dresses, suits, and accessories', now(), now()),
  ('dd3f9d45-9e3e-4d3f-a7f1-d92f7c4c3b4e', 'HAIR & MAKEUP', 'face', 'Wedding hair styling and makeup services', now(), now()),
  ('ee4f9e46-0f3e-4e3f-a7f1-d92f7c4c3b5e', 'RENTALS', 'chair', 'Event furniture and decor rentals', now(), now()),
  ('ff5f9f47-1f3e-4f3f-a7f1-d92f7c4c3b6e', 'STATIONERY', 'mail', 'Wedding invitations and paper goods', now(), now()),
  ('66af9a48-2f3e-5f3f-a7f1-d92f7c4c3b7e', 'STYLING', 'style', 'Event styling and design services', now(), now()),
  ('77bf9b49-3f3e-6f3f-a7f1-d92f7c4c3b8e', 'TRANSPORTATION', 'directions_car', 'Wedding transportation services', now(), now()),
  ('88cf9c50-4f3e-7f3f-a7f1-d92f7c4c3b9e', 'VIDEOGRAPHERS', 'videocam', 'Wedding videography services', now(), now()),
  ('3e8b2d76-1f5a-4c9d-b8e2-f1d3b7a8c9e0', 'CATERING/STAFFING', 'restaurant', 'Food, beverage, and staffing services', now(), now()),
  ('051803d5-52fc-4b1d-916d-710c758b9df8', 'LIVE MUSIC', 'music_note', 'Live music and entertainment', now(), now()),
  ('5a0d4f98-3a7c-6e1f-da04-a3f5d9c0e1a2', 'FLORALS/FLORAL PRESERVATION', 'local_florist', 'Floral design and preservation services', now(), now()),
  ('99df9d51-5f3e-8f3f-a7f1-d92f7c4c3bae', 'DJ''S', 'queue_music', 'Professional wedding DJs and entertainment', now(), now()),
  ('4d7f9c44-9c1e-4b3f-a7f1-d92f7c4c3b2f', 'OFFICIANTS', 'people', 'Wedding ceremony officiants and celebrants', now(), now()),
  ('2d5f9a42-9c1e-4b3f-a7f1-d92f7c4c3b1e', 'VENUES', 'location_on', 'Wedding venues and event spaces', now(), now()),
  ('5d8f9d45-9c1e-4b3f-a7f1-d92f7c4c3b3f', 'PHOTOGRAPHERS', 'photo_camera', 'Wedding photography services', now(), now())
ON CONFLICT (id) DO 
  UPDATE SET 
    name = EXCLUDED.name,
    icon = EXCLUDED.icon,
    description = EXCLUDED.description,
    updated_at = now();
