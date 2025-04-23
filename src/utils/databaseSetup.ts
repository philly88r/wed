import { supabase } from '../supabaseClient';

/**
 * Automatically sets up the database structure needed for the moodboard functionality
 * This eliminates the need to manually run SQL scripts
 */
export const setupMoodboardDatabase = async (): Promise<void> => {
  try {
    console.log('Setting up moodboard database...');
    
    // 1. Create storage bucket for moodboard images if it doesn't exist
    const { data: buckets } = await supabase.storage.listBuckets();
    if (!buckets?.find(bucket => bucket.name === 'moodboard-images')) {
      await supabase.storage.createBucket('moodboard-images', {
        public: true,
        fileSizeLimit: 10485760, // 10MB
      });
      console.log('Created moodboard-images storage bucket');
    }
    
    // 2. Create the moodboards table if it doesn't exist
    const { error: createMoodboardsError } = await supabase.rpc(
      'execute_sql',
      {
        sql_query: `
          CREATE TABLE IF NOT EXISTS moodboards (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
            title TEXT NOT NULL,
            description TEXT,
            colors JSONB,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
          
          -- Create index for better performance if it doesn't exist
          DO $$
          BEGIN
            IF NOT EXISTS (
              SELECT 1 FROM pg_indexes 
              WHERE tablename = 'moodboards' 
              AND indexname = 'idx_moodboards_user_id'
            ) THEN
              CREATE INDEX idx_moodboards_user_id ON moodboards(user_id);
            END IF;
          END
          $$;
        `
      }
    );
    
    if (createMoodboardsError) {
      console.error('Error creating moodboards table:', createMoodboardsError);
    } else {
      console.log('Moodboards table created or already exists');
    }
    
    // 3. Create the moodboard_images table if it doesn't exist
    const { error: createImagesError } = await supabase.rpc(
      'execute_sql',
      {
        sql_query: `
          CREATE TABLE IF NOT EXISTS moodboard_images (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            moodboard_id UUID REFERENCES moodboards(id) ON DELETE CASCADE,
            title TEXT NOT NULL,
            description TEXT,
            url TEXT NOT NULL,
            storage_path TEXT,
            category TEXT NOT NULL,
            source TEXT,
            position INTEGER,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
          
          -- Create index for better performance if it doesn't exist
          DO $$
          BEGIN
            IF NOT EXISTS (
              SELECT 1 FROM pg_indexes 
              WHERE tablename = 'moodboard_images' 
              AND indexname = 'idx_moodboard_images_moodboard_id'
            ) THEN
              CREATE INDEX idx_moodboard_images_moodboard_id ON moodboard_images(moodboard_id);
            END IF;
          END
          $$;
        `
      }
    );
    
    if (createImagesError) {
      console.error('Error creating moodboard_images table:', createImagesError);
    } else {
      console.log('Moodboard_images table created or already exists');
    }
    
    // 4. Set up RLS policies
    const { error: rlsError } = await supabase.rpc(
      'execute_sql',
      {
        sql_query: `
          -- Enable RLS on tables if not already enabled
          ALTER TABLE moodboards ENABLE ROW LEVEL SECURITY;
          ALTER TABLE moodboard_images ENABLE ROW LEVEL SECURITY;
          
          -- Create policies for moodboards if they don't exist
          DO $$
          BEGIN
            IF NOT EXISTS (
              SELECT 1 FROM pg_policies 
              WHERE tablename = 'moodboards' 
              AND policyname = 'Users can view their own moodboards'
            ) THEN
              CREATE POLICY "Users can view their own moodboards" 
              ON moodboards FOR SELECT 
              USING (auth.uid() = user_id);
            END IF;
            
            IF NOT EXISTS (
              SELECT 1 FROM pg_policies 
              WHERE tablename = 'moodboards' 
              AND policyname = 'Users can insert their own moodboards'
            ) THEN
              CREATE POLICY "Users can insert their own moodboards" 
              ON moodboards FOR INSERT 
              WITH CHECK (auth.uid() = user_id);
            END IF;
            
            IF NOT EXISTS (
              SELECT 1 FROM pg_policies 
              WHERE tablename = 'moodboards' 
              AND policyname = 'Users can update their own moodboards'
            ) THEN
              CREATE POLICY "Users can update their own moodboards" 
              ON moodboards FOR UPDATE 
              USING (auth.uid() = user_id);
            END IF;
            
            IF NOT EXISTS (
              SELECT 1 FROM pg_policies 
              WHERE tablename = 'moodboards' 
              AND policyname = 'Users can delete their own moodboards'
            ) THEN
              CREATE POLICY "Users can delete their own moodboards" 
              ON moodboards FOR DELETE 
              USING (auth.uid() = user_id);
            END IF;
          END
          $$;
          
          -- Create policies for moodboard_images if they don't exist
          DO $$
          BEGIN
            IF NOT EXISTS (
              SELECT 1 FROM pg_policies 
              WHERE tablename = 'moodboard_images' 
              AND policyname = 'Users can view their own moodboard images'
            ) THEN
              CREATE POLICY "Users can view their own moodboard images" 
              ON moodboard_images FOR SELECT 
              USING (EXISTS (
                SELECT 1 FROM moodboards
                WHERE moodboards.id = moodboard_images.moodboard_id
                AND moodboards.user_id = auth.uid()
              ));
            END IF;
            
            IF NOT EXISTS (
              SELECT 1 FROM pg_policies 
              WHERE tablename = 'moodboard_images' 
              AND policyname = 'Users can insert their own moodboard images'
            ) THEN
              CREATE POLICY "Users can insert their own moodboard images" 
              ON moodboard_images FOR INSERT 
              WITH CHECK (EXISTS (
                SELECT 1 FROM moodboards
                WHERE moodboards.id = moodboard_images.moodboard_id
                AND moodboards.user_id = auth.uid()
              ));
            END IF;
            
            IF NOT EXISTS (
              SELECT 1 FROM pg_policies 
              WHERE tablename = 'moodboard_images' 
              AND policyname = 'Users can update their own moodboard images'
            ) THEN
              CREATE POLICY "Users can update their own moodboard images" 
              ON moodboard_images FOR UPDATE 
              USING (EXISTS (
                SELECT 1 FROM moodboards
                WHERE moodboards.id = moodboard_images.moodboard_id
                AND moodboards.user_id = auth.uid()
              ));
            END IF;
            
            IF NOT EXISTS (
              SELECT 1 FROM pg_policies 
              WHERE tablename = 'moodboard_images' 
              AND policyname = 'Users can delete their own moodboard images'
            ) THEN
              CREATE POLICY "Users can delete their own moodboard images" 
              ON moodboard_images FOR DELETE 
              USING (EXISTS (
                SELECT 1 FROM moodboards
                WHERE moodboards.id = moodboard_images.moodboard_id
                AND moodboards.user_id = auth.uid()
              ));
            END IF;
          END
          $$;
        `
      }
    );
    
    if (rlsError) {
      console.error('Error setting up RLS policies:', rlsError);
    } else {
      console.log('RLS policies created or already exist');
    }
    
    // 5. Create public access policies
    const { error: publicAccessError } = await supabase.rpc(
      'execute_sql',
      {
        sql_query: `
          -- Create public access policy for anonymous users
          DO $$
          BEGIN
            IF NOT EXISTS (
              SELECT 1 FROM pg_policies 
              WHERE tablename = 'moodboards' 
              AND policyname = 'Allow anonymous access to moodboards'
            ) THEN
              CREATE POLICY "Allow anonymous access to moodboards" 
              ON moodboards FOR SELECT 
              USING (true);
            END IF;
            
            IF NOT EXISTS (
              SELECT 1 FROM pg_policies 
              WHERE tablename = 'moodboard_images' 
              AND policyname = 'Allow anonymous access to moodboard images'
            ) THEN
              CREATE POLICY "Allow anonymous access to moodboard images" 
              ON moodboard_images FOR SELECT 
              USING (true);
            END IF;
          END
          $$;
          
          -- Create storage policies if they don't exist
          DO $$
          BEGIN
            IF NOT EXISTS (
              SELECT 1 FROM pg_policies 
              WHERE tablename = 'objects' 
              AND schemaname = 'storage'
              AND policyname = 'Public users can read moodboard images'
            ) THEN
              CREATE POLICY "Public users can read moodboard images"
              ON storage.objects FOR SELECT
              USING (bucket_id = 'moodboard-images');
            END IF;
            
            IF NOT EXISTS (
              SELECT 1 FROM pg_policies 
              WHERE tablename = 'objects' 
              AND schemaname = 'storage'
              AND policyname = 'Authenticated users can upload moodboard images'
            ) THEN
              CREATE POLICY "Authenticated users can upload moodboard images"
              ON storage.objects FOR INSERT
              WITH CHECK (
                bucket_id = 'moodboard-images' AND
                auth.role() = 'authenticated'
              );
            END IF;
            
            IF NOT EXISTS (
              SELECT 1 FROM pg_policies 
              WHERE tablename = 'objects' 
              AND schemaname = 'storage'
              AND policyname = 'Users can update their own moodboard images'
            ) THEN
              CREATE POLICY "Users can update their own moodboard images"
              ON storage.objects FOR UPDATE
              USING (
                bucket_id = 'moodboard-images' AND
                auth.uid() = owner
              );
            END IF;
            
            IF NOT EXISTS (
              SELECT 1 FROM pg_policies 
              WHERE tablename = 'objects' 
              AND schemaname = 'storage'
              AND policyname = 'Users can delete their own moodboard images'
            ) THEN
              CREATE POLICY "Users can delete their own moodboard images"
              ON storage.objects FOR DELETE
              USING (
                bucket_id = 'moodboard-images' AND
                auth.uid() = owner
              );
            END IF;
          END
          $$;
        `
      }
    );
    
    if (publicAccessError) {
      console.error('Error setting up public access policies:', publicAccessError);
    } else {
      console.log('Public access policies created or already exist');
    }
    
    console.log('Moodboard database setup complete');
  } catch (error) {
    console.error('Error setting up moodboard database:', error);
  }
};

/**
 * Checks if the current user has a moodboard, creates one if not
 * Returns the moodboard ID
 */
export const ensureUserHasMoodboard = async (): Promise<string | null> => {
  try {
    // Get current user
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;
    
    if (!user) {
      console.log('No authenticated user found');
      return null;
    }
    
    // Check if user has a moodboard
    const { data: moodboards, error: fetchError } = await supabase
      .from('moodboards')
      .select('id')
      .eq('user_id', user.id)
      .limit(1);
    
    if (fetchError) {
      console.error('Error fetching moodboards:', fetchError);
      return null;
    }
    
    // If user has a moodboard, return its ID
    if (moodboards && moodboards.length > 0) {
      return moodboards[0].id;
    }
    
    // Create a new moodboard for the user
    const defaultColors = ['#054697', '#FFE8E4', '#FF5C39', '#B8BDD7']; // Altare brand colors
    const { data: newBoard, error: createError } = await supabase
      .from('moodboards')
      .insert([{
        user_id: user.id,
        title: 'My Wedding Moodboard',
        description: 'Inspiration for my wedding',
        colors: defaultColors
      }])
      .select();
    
    if (createError) {
      console.error('Error creating moodboard:', createError);
      return null;
    }
    
    return newBoard?.[0]?.id || null;
  } catch (error) {
    console.error('Error ensuring user has moodboard:', error);
    return null;
  }
};
