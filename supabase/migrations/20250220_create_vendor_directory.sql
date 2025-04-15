-- Create vendor categories table
create table if not exists public.vendor_categories (
    id uuid default gen_random_uuid() primary key,
    name text not null,
    slug text not null unique,
    icon text,
    description text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create vendors table
create table if not exists public.vendors (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id),
    category_id uuid references vendor_categories(id) not null,
    business_name text not null,
    slug text not null unique,
    description text,
    short_description text,
    logo_url text,
    website_url text,
    phone text,
    email text,
    instagram_handle text,
    facebook_url text,
    tiktok_handle text,
    pinterest_url text,
    youtube_url text,
    starting_price numeric,
    price_range text check (price_range in ('$', '$$', '$$$', '$$$$')),
    years_in_business integer,
    is_featured boolean default false,
    is_verified boolean default false,
    average_rating numeric check (average_rating >= 0 and average_rating <= 5),
    total_reviews integer default 0,
    status text default 'pending' check (status in ('pending', 'active', 'suspended')),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create vendor locations table (vendors can have multiple locations)
create table if not exists public.vendor_locations (
    id uuid default gen_random_uuid() primary key,
    vendor_id uuid references vendors(id) on delete cascade not null,
    address_line1 text not null,
    address_line2 text,
    city text not null,
    state text not null,
    zip_code text not null,
    latitude numeric,
    longitude numeric,
    is_primary boolean default false,
    service_radius integer, -- in miles
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create vendor reviews table
create table if not exists public.vendor_reviews (
    id uuid default gen_random_uuid() primary key,
    vendor_id uuid references vendors(id) on delete cascade not null,
    user_id uuid references auth.users(id) not null,
    rating integer not null check (rating >= 1 and rating <= 5),
    review_text text,
    event_date date,
    response_text text,
    response_date timestamp with time zone,
    status text default 'pending' check (status in ('pending', 'approved', 'rejected')),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(vendor_id, user_id) -- One review per vendor per user
);

-- Create vendor images table
create table if not exists public.vendor_images (
    id uuid default gen_random_uuid() primary key,
    vendor_id uuid references vendors(id) on delete cascade not null,
    image_url text not null,
    caption text,
    is_featured boolean default false,
    order_index integer default 0,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create vendor services table (for specific services offered)
create table if not exists public.vendor_services (
    id uuid default gen_random_uuid() primary key,
    vendor_id uuid references vendors(id) on delete cascade not null,
    name text not null,
    description text,
    price_starts_at numeric,
    is_featured boolean default false,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create vendor availability table
create table if not exists public.vendor_availability (
    id uuid default gen_random_uuid() primary key,
    vendor_id uuid references vendors(id) on delete cascade not null,
    date date not null,
    status text check (status in ('available', 'tentative', 'booked')),
    note text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(vendor_id, date)
);

-- Create vendor tags table
create table if not exists public.vendor_tags (
    id uuid default gen_random_uuid() primary key,
    name text not null unique,
    category_id uuid references vendor_categories(id),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create vendor_tags_junction table
create table if not exists public.vendor_tags_junction (
    vendor_id uuid references vendors(id) on delete cascade,
    tag_id uuid references vendor_tags(id) on delete cascade,
    primary key (vendor_id, tag_id)
);

-- Add indexes for better performance
create index if not exists idx_vendors_category on vendors(category_id);
create index if not exists idx_vendor_locations_state_city on vendor_locations(state, city);
create index if not exists idx_vendors_rating on vendors(average_rating);
create index if not exists idx_vendors_price_range on vendors(price_range);
create index if not exists idx_vendor_reviews_vendor on vendor_reviews(vendor_id);
create index if not exists idx_vendor_availability_date on vendor_availability(date);

-- Add RLS policies
alter table public.vendors enable row level security;
alter table public.vendor_locations enable row level security;
alter table public.vendor_reviews enable row level security;
alter table public.vendor_images enable row level security;
alter table public.vendor_services enable row level security;
alter table public.vendor_availability enable row level security;

-- Vendors policies
create policy "Public vendors are viewable by everyone"
    on public.vendors for select using (status = 'active');

create policy "Users can insert their own vendor profiles"
    on public.vendors for insert with check (auth.uid() = user_id);

create policy "Users can update their own vendor profiles"
    on public.vendors for update using (auth.uid() = user_id);

-- Reviews policies
create policy "Public reviews are viewable by everyone"
    on public.vendor_reviews for select using (status = 'approved');

create policy "Users can insert their own reviews"
    on public.vendor_reviews for insert with check (auth.uid() = user_id);

create policy "Users can update their own reviews"
    on public.vendor_reviews for update using (auth.uid() = user_id);

-- Images policies
create policy "Public images are viewable by everyone"
    on public.vendor_images for select using (true);

create policy "Vendors can manage their own images"
    on public.vendor_images for all using (
        auth.uid() in (
            select user_id from vendors where id = vendor_images.vendor_id
        )
    );

-- Add some initial categories
insert into public.vendor_categories (name, slug, icon, description) values
    ('Venues', 'venues', 'venue', 'Wedding venues, reception locations, and ceremony sites'),
    ('Photography', 'photography', 'camera', 'Wedding photographers and videographers'),
    ('Catering', 'catering', 'restaurant', 'Wedding caterers and food services'),
    ('Music', 'music', 'music_note', 'DJs, bands, and musicians'),
    ('Florists', 'florists', 'local_florist', 'Wedding florists and flower arrangements'),
    ('Planners', 'planners', 'event', 'Wedding planners and coordinators'),
    ('Attire', 'attire', 'dress', 'Wedding dresses, suits, and accessories'),
    ('Beauty', 'beauty', 'spa', 'Hair stylists, makeup artists, and beauty services'),
    ('Rentals', 'rentals', 'chair', 'Furniture, decor, and equipment rentals'),
    ('Transportation', 'transportation', 'directions_car', 'Limos, buses, and transportation services');

-- Add triggers for updating timestamps
create trigger handle_vendor_updated_at before update
    on public.vendors for each row execute procedure public.handle_updated_at();

create trigger handle_vendor_locations_updated_at before update
    on public.vendor_locations for each row execute procedure public.handle_updated_at();

create trigger handle_vendor_reviews_updated_at before update
    on public.vendor_reviews for each row execute procedure public.handle_updated_at();

create trigger handle_vendor_services_updated_at before update
    on public.vendor_services for each row execute procedure public.handle_updated_at();

create trigger handle_vendor_availability_updated_at before update
    on public.vendor_availability for each row execute procedure public.handle_updated_at();
