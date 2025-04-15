-- Create venue_tables table for visual layout
CREATE TABLE IF NOT EXISTS venue_tables (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    shape VARCHAR(50) NOT NULL,
    seats INTEGER NOT NULL,
    color VARCHAR(50),
    position JSONB NOT NULL DEFAULT '{"x": 0, "y": 0, "width": 2, "height": 2}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create seating_tables table for guest assignments
CREATE TABLE IF NOT EXISTS seating_tables (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    shape VARCHAR(50) NOT NULL,
    seats INTEGER NOT NULL,
    color VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create table assignments table for seating
CREATE TABLE IF NOT EXISTS table_assignments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    table_id UUID REFERENCES seating_tables(id) ON DELETE CASCADE,
    guest_id UUID REFERENCES guests(id) ON DELETE CASCADE,
    seat_number INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(table_id, guest_id)
);

-- Create comments table for discussions
CREATE TABLE IF NOT EXISTS comments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    section VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    commenter_name TEXT NOT NULL,
    parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    resolved BOOLEAN DEFAULT FALSE,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
