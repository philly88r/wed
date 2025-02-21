-- Create vendors table
CREATE TABLE IF NOT EXISTS vendors (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT,
    email VARCHAR(255),
    phone VARCHAR(20),
    website VARCHAR(255),
    instagram VARCHAR(255),
    facebook VARCHAR(255),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(50),
    zip VARCHAR(10),
    rating DECIMAL(2,1),
    price_range VARCHAR(10),
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert some dummy vendors
INSERT INTO vendors (name, category, description, email, phone, website, city, state, rating, price_range, status)
VALUES
    ('Artistic Floral Designs', 'Florist', 'Specializing in romantic and elegant wedding florals', 'info@artisticfloral.com', '555-0101', 'www.artisticfloral.com', 'Philadelphia', 'PA', 4.8, '$$$', 'active'),
    ('Bella Bridal Boutique', 'Bridal Shop', 'Luxury bridal gowns and accessories', 'appointments@bellabride.com', '555-0102', 'www.bellabride.com', 'Philadelphia', 'PA', 4.9, '$$$$', 'active'),
    ('Cake Creations by Claire', 'Bakery', 'Custom wedding cakes and desserts', 'claire@cakecreations.com', '555-0103', 'www.cakecreations.com', 'Cherry Hill', 'NJ', 4.7, '$$', 'active'),
    ('Divine DJs', 'Entertainment', 'Professional wedding DJs and MCs', 'bookings@divinedjs.com', '555-0104', 'www.divinedjs.com', 'Philadelphia', 'PA', 4.6, '$$', 'active'),
    ('Elegant Events Planning', 'Wedding Planner', 'Full-service wedding planning and coordination', 'info@elegantevents.com', '555-0105', 'www.elegantevents.com', 'Philadelphia', 'PA', 5.0, '$$$$', 'active'),
    ('Fantastic Photography', 'Photography', 'Capturing your special moments', 'book@fantasticphoto.com', '555-0106', 'www.fantasticphoto.com', 'Media', 'PA', 4.8, '$$$', 'active'),
    ('Grand Ballroom', 'Venue', 'Historic venue in downtown Philadelphia', 'events@grandballroom.com', '555-0107', 'www.grandballroom.com', 'Philadelphia', 'PA', 4.9, '$$$$', 'active'),
    ('Heavenly Catering', 'Catering', 'Gourmet wedding catering services', 'taste@heavenlycatering.com', '555-0108', 'www.heavenlycatering.com', 'King of Prussia', 'PA', 4.7, '$$$', 'active'),
    ('Innovative Lighting', 'Lighting', 'Professional wedding lighting design', 'design@innovativelighting.com', '555-0109', 'www.innovativelighting.com', 'Philadelphia', 'PA', 4.6, '$$', 'active'),
    ('Just Perfect Rentals', 'Rentals', 'Wedding furniture and decor rentals', 'rentals@justperfect.com', '555-0110', 'www.justperfect.com', 'Philadelphia', 'PA', 4.5, '$$', 'active'),
    ('Magical Moments Video', 'Videography', 'Cinematic wedding videos', 'film@magicalmoments.com', '555-0111', 'www.magicalmoments.com', 'Philadelphia', 'PA', 4.8, '$$$', 'active'),
    ('Natural Beauty Makeup', 'Beauty', 'Wedding makeup and hair services', 'beauty@naturalbeauty.com', '555-0112', 'www.naturalbeauty.com', 'Philadelphia', 'PA', 4.9, '$$', 'active'),
    ('Orchestral Harmony', 'Music', 'Live wedding music and orchestral services', 'music@orchestralharmony.com', '555-0113', 'www.orchestralharmony.com', 'Philadelphia', 'PA', 4.7, '$$$', 'active'),
    ('Premier Transportation', 'Transportation', 'Luxury wedding transportation', 'rides@premiertransport.com', '555-0114', 'www.premiertransport.com', 'Philadelphia', 'PA', 4.6, '$$', 'active'),
    ('Rustic Charm Venue', 'Venue', 'Barn wedding venue with modern amenities', 'events@rusticcharm.com', '555-0115', 'www.rusticcharm.com', 'West Chester', 'PA', 4.8, '$$$', 'active'),
    ('Sweet Memories Favors', 'Favors', 'Custom wedding favors and gifts', 'orders@sweetmemories.com', '555-0116', 'www.sweetmemories.com', 'Philadelphia', 'PA', 4.5, '$', 'active'),
    ('Timeless Traditions', 'Wedding Planner', 'Traditional wedding planning services', 'plan@timelesstraditions.com', '555-0117', 'www.timelesstraditions.com', 'Philadelphia', 'PA', 4.7, '$$$', 'active'),
    ('Unique Invitations', 'Stationery', 'Custom wedding invitations and stationery', 'design@uniqueinvites.com', '555-0118', 'www.uniqueinvites.com', 'Philadelphia', 'PA', 4.8, '$$', 'active'),
    ('Vintage Valuables', 'Rentals', 'Vintage decor and furniture rentals', 'rentals@vintagevaluables.com', '555-0119', 'www.vintagevaluables.com', 'Philadelphia', 'PA', 4.6, '$$', 'active'),
    ('Wonderful Weddings', 'Wedding Planner', 'Boutique wedding planning and design', 'hello@wonderfulweddings.com', '555-0120', 'www.wonderfulweddings.com', 'Philadelphia', 'PA', 4.9, '$$$$', 'active')
);
