-- Vision Board Database Setup

-- Create a storage bucket for vision board images
INSERT INTO storage.buckets (id, name, public)
VALUES ('vision-board-images', 'vision-board-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create the vision_boards table to store board metadata
CREATE TABLE IF NOT EXISTS vision_boards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    colors JSONB, -- Store the color palette
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create the vision_board_images table to store individual images
CREATE TABLE IF NOT EXISTS vision_board_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vision_board_id UUID REFERENCES vision_boards(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    url TEXT NOT NULL,
    storage_path TEXT, -- Path to the image in the storage bucket
    category TEXT NOT NULL,
    source TEXT,
    position INTEGER, -- For ordering images in the board
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS (Row Level Security) policies to secure the data
DO $$
BEGIN
    -- Enable RLS on tables if not already enabled
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE tablename = 'vision_boards' 
        AND rowsecurity = true
    ) THEN
        ALTER TABLE vision_boards ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE tablename = 'vision_board_images' 
        AND rowsecurity = true
    ) THEN
        ALTER TABLE vision_board_images ENABLE ROW LEVEL SECURITY;
    END IF;
    
    -- Create policies for vision_boards if they don't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'vision_boards' 
        AND policyname = 'Users can view their own vision boards'
    ) THEN
        CREATE POLICY "Users can view their own vision boards" 
        ON vision_boards FOR SELECT 
        USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'vision_boards' 
        AND policyname = 'Users can insert their own vision boards'
    ) THEN
        CREATE POLICY "Users can insert their own vision boards" 
        ON vision_boards FOR INSERT 
        WITH CHECK (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'vision_boards' 
        AND policyname = 'Users can update their own vision boards'
    ) THEN
        CREATE POLICY "Users can update their own vision boards" 
        ON vision_boards FOR UPDATE 
        USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'vision_boards' 
        AND policyname = 'Users can delete their own vision boards'
    ) THEN
        CREATE POLICY "Users can delete their own vision boards" 
        ON vision_boards FOR DELETE 
        USING (auth.uid() = user_id);
    END IF;
    
    -- Create policies for vision_board_images if they don't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'vision_board_images' 
        AND policyname = 'Users can view their own vision board images'
    ) THEN
        CREATE POLICY "Users can view their own vision board images" 
        ON vision_board_images FOR SELECT 
        USING (EXISTS (
            SELECT 1 FROM vision_boards
            WHERE vision_boards.id = vision_board_images.vision_board_id
            AND vision_boards.user_id = auth.uid()
        ));
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'vision_board_images' 
        AND policyname = 'Users can insert their own vision board images'
    ) THEN
        CREATE POLICY "Users can insert their own vision board images" 
        ON vision_board_images FOR INSERT 
        WITH CHECK (EXISTS (
            SELECT 1 FROM vision_boards
            WHERE vision_boards.id = vision_board_images.vision_board_id
            AND vision_boards.user_id = auth.uid()
        ));
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'vision_board_images' 
        AND policyname = 'Users can update their own vision board images'
    ) THEN
        CREATE POLICY "Users can update their own vision board images" 
        ON vision_board_images FOR UPDATE 
        USING (EXISTS (
            SELECT 1 FROM vision_boards
            WHERE vision_boards.id = vision_board_images.vision_board_id
            AND vision_boards.user_id = auth.uid()
        ));
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'vision_board_images' 
        AND policyname = 'Users can delete their own vision board images'
    ) THEN
        CREATE POLICY "Users can delete their own vision board images" 
        ON vision_board_images FOR DELETE 
        USING (EXISTS (
            SELECT 1 FROM vision_boards
            WHERE vision_boards.id = vision_board_images.vision_board_id
            AND vision_boards.user_id = auth.uid()
        ));
    END IF;
    
    -- Create storage policies if they don't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND schemaname = 'storage'
        AND policyname = 'Public users can read vision board images'
    ) THEN
        CREATE POLICY "Public users can read vision board images"
        ON storage.objects FOR SELECT
        USING (bucket_id = 'vision-board-images');
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND schemaname = 'storage'
        AND policyname = 'Authenticated users can upload vision board images'
    ) THEN
        CREATE POLICY "Authenticated users can upload vision board images"
        ON storage.objects FOR INSERT
        WITH CHECK (
            bucket_id = 'vision-board-images' AND
            auth.role() = 'authenticated'
        );
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND schemaname = 'storage'
        AND policyname = 'Users can update their own vision board images'
    ) THEN
        CREATE POLICY "Users can update their own vision board images"
        ON storage.objects FOR UPDATE
        USING (
            bucket_id = 'vision-board-images' AND
            auth.uid() = owner
        );
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND schemaname = 'storage'
        AND policyname = 'Users can delete their own vision board images'
    ) THEN
        CREATE POLICY "Users can delete their own vision board images"
        ON storage.objects FOR DELETE
        USING (
            bucket_id = 'vision-board-images' AND
            auth.uid() = owner
        );
    END IF;
END
$$;

-- Create indexes for better performance if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'vision_boards' 
        AND indexname = 'idx_vision_boards_user_id'
    ) THEN
        CREATE INDEX idx_vision_boards_user_id ON vision_boards(user_id);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'vision_board_images' 
        AND indexname = 'idx_vision_board_images_vision_board_id'
    ) THEN
        CREATE INDEX idx_vision_board_images_vision_board_id ON vision_board_images(vision_board_id);
    END IF;
END
$$;

-- Migration query to move data from old 'images' table if it exists
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'images') THEN
        -- Create a default vision board for each user if they don't have one already
        INSERT INTO vision_boards (user_id, title, description, colors)
        SELECT DISTINCT i.user_id, 'My Wedding Vision Board', 'Imported from previous version', 
               '["#054697", "#FFE8E4", "#FF5C39", "#B8BDD7"]'::jsonb
        FROM images i
        WHERE NOT EXISTS (
            SELECT 1 FROM vision_boards v WHERE v.user_id = i.user_id
        );
        
        -- Move images to the new table if they haven't been moved already
        INSERT INTO vision_board_images (vision_board_id, title, description, url, category, source, position)
        SELECT 
            (SELECT id FROM vision_boards WHERE user_id = i.user_id LIMIT 1),
            i.title,
            i.description,
            i.url,
            i.category,
            i.source,
            ROW_NUMBER() OVER (PARTITION BY i.user_id ORDER BY i.created_at)
        FROM images i
        WHERE NOT EXISTS (
            -- Skip images that have already been migrated (based on URL)
            SELECT 1 FROM vision_board_images vbi
            JOIN vision_boards vb ON vbi.vision_board_id = vb.id
            WHERE vb.user_id = i.user_id AND vbi.url = i.url
        );
    END IF;
END
$$;

-- Verification queries to check the setup
-- SELECT * FROM storage.buckets WHERE name = 'vision-board-images';
-- SELECT * FROM vision_boards LIMIT 5;
-- SELECT * FROM vision_board_images LIMIT 5;
