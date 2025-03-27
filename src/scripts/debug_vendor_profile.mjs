import pkg from 'pg';
import fs from 'fs';
const { Pool } = pkg;

const pool = new Pool({
    connectionString: 'postgresql://postgres:Yitbos88@db.yemkduykvfdjmldxfphq.supabase.co:5432/postgres',
    ssl: {
        rejectUnauthorized: false
    }
});

async function debugVendorProfile() {
    const client = await pool.connect();
    
    try {
        // Get the vendor ID for Purslane Catering
        const vendorResult = await client.query(`
            SELECT id FROM vendors WHERE name = 'PURSLANE CATERING'
        `);
        
        if (vendorResult.rows.length === 0) {
            throw new Error('Vendor not found: PURSLANE CATERING');
        }
        
        const vendorId = vendorResult.rows[0].id;
        console.log('Found vendor ID:', vendorId);
        
        // Get complete vendor data
        const vendorDataResult = await client.query(`
            SELECT * FROM vendors WHERE id = $1
        `, [vendorId]);
        
        if (vendorDataResult.rows.length === 0) {
            throw new Error(`No vendor found with ID: ${vendorId}`);
        }
        
        const vendorData = vendorDataResult.rows[0];
        
        // Save raw vendor data to a file for inspection
        fs.writeFileSync(
            'vendor_data_debug.json', 
            JSON.stringify(vendorData, null, 2)
        );
        console.log('Raw vendor data saved to vendor_data_debug.json');
        
        // Create a properly structured vendor object with default values for missing fields
        const structuredVendor = {
            id: vendorData.id,
            name: vendorData.name || '',
            slug: vendorData.slug || '',
            description: vendorData.description || '',
            location: vendorData.location || '',
            category_id: vendorData.category_id || '',
            is_featured: !!vendorData.is_featured,
            is_hidden: !!vendorData.is_hidden,
            
            // Contact info
            contact_info: {
                email: vendorData.contact_info?.email || '',
                phone: vendorData.contact_info?.phone || ''
            },
            
            // Social media
            social_media: {
                instagram: vendorData.social_media?.instagram || '',
                facebook: vendorData.social_media?.facebook || '',
                twitter: vendorData.social_media?.twitter || '',
                website: vendorData.social_media?.website || ''
            },
            
            // Pricing tier
            pricing_tier: {
                tier: vendorData.pricing_tier?.tier || 'budget',
                price_range: { 
                    min: vendorData.pricing_tier?.price_range?.min || 0, 
                    max: vendorData.pricing_tier?.price_range?.max || 0, 
                    currency: vendorData.pricing_tier?.price_range?.currency || 'USD' 
                },
                deposit_required: { 
                    percentage: vendorData.pricing_tier?.deposit_required?.percentage || 0, 
                    amount: vendorData.pricing_tier?.deposit_required?.amount || 0, 
                    currency: vendorData.pricing_tier?.deposit_required?.currency || 'USD' 
                },
                payment_methods: vendorData.pricing_tier?.payment_methods || [],
                cancellation_policy: vendorData.pricing_tier?.cancellation_policy || ''
            },
            
            // Portfolio
            portfolio: {
                videos: vendorData.portfolio?.videos || [],
                photos: vendorData.portfolio?.photos || [],
                testimonials: vendorData.portfolio?.testimonials || [],
                featured_work: vendorData.portfolio?.featured_work || [],
                sample_work: vendorData.portfolio?.sample_work || []
            },
            
            // Availability
            availability: {
                lead_time_days: vendorData.availability?.lead_time_days || 0,
                peak_season: vendorData.availability?.peak_season || [],
                off_peak_season: vendorData.availability?.off_peak_season || [],
                travel_zones: vendorData.availability?.travel_zones || [],
                calendar_sync_enabled: vendorData.availability?.calendar_sync_enabled || false,
                calendar_url: vendorData.availability?.calendar_url || null
            },
            
            // Experience
            experience: {
                years_in_business: vendorData.experience?.years_in_business || 0,
                weddings_completed: vendorData.experience?.weddings_completed || 0,
                awards: vendorData.experience?.awards || [],
                certifications: vendorData.experience?.certifications || [],
                insurance: {
                    has_insurance: vendorData.experience?.insurance?.has_insurance || false,
                    coverage_details: vendorData.experience?.insurance?.coverage_details || ''
                },
                associations: vendorData.experience?.associations || [],
                media_features: vendorData.experience?.media_features || []
            },
            
            // Customization options
            customization_options: {
                package_addons: vendorData.customization_options?.package_addons || [],
                special_requests_policy: vendorData.customization_options?.special_requests_policy || '',
                cultural_expertise: vendorData.customization_options?.cultural_expertise || [],
                multi_day_events: {
                    available: vendorData.customization_options?.multi_day_events?.available || false,
                    details: vendorData.customization_options?.multi_day_events?.details || ''
                },
                equipment: vendorData.customization_options?.equipment || []
            },
            
            // Team info
            team_info: {
                size: vendorData.team_info?.size || 0,
                roles: vendorData.team_info?.roles || [],
                backup_policy: vendorData.team_info?.backup_policy || '',
                members: vendorData.team_info?.members || [],
                languages: vendorData.team_info?.languages || [],
                dress_code: vendorData.team_info?.dress_code || ''
            },
            
            // Logistics
            logistics: {
                setup_time_minutes: vendorData.logistics?.setup_time_minutes || 0,
                breakdown_time_minutes: vendorData.logistics?.breakdown_time_minutes || 0,
                space_requirements: vendorData.logistics?.space_requirements || '',
                technical_requirements: vendorData.logistics?.technical_requirements || [],
                parking_needs: vendorData.logistics?.parking_needs || '',
                weather_policy: vendorData.logistics?.weather_policy || ''
            },
            
            // Collaboration
            collaboration: {
                preferred_vendors: vendorData.collaboration?.preferred_vendors || [],
                venue_partnerships: vendorData.collaboration?.venue_partnerships || [],
                package_deals: vendorData.collaboration?.package_deals || [],
                coordinator_experience: vendorData.collaboration?.coordinator_experience || ''
            },
            
            created_at: vendorData.created_at,
            updated_at: vendorData.updated_at
        };
        
        // Save structured vendor data to a file
        fs.writeFileSync(
            'structured_vendor_data.json', 
            JSON.stringify(structuredVendor, null, 2)
        );
        console.log('Structured vendor data saved to structured_vendor_data.json');
        
        // Update the vendor with the structured data
        await client.query(`
            UPDATE vendors 
            SET 
                contact_info = $1,
                social_media = $2,
                pricing_tier = $3,
                portfolio = $4,
                availability = $5,
                experience = $6,
                customization_options = $7,
                team_info = $8,
                logistics = $9,
                collaboration = $10,
                updated_at = NOW()
            WHERE id = $11
        `, [
            JSON.stringify(structuredVendor.contact_info),
            JSON.stringify(structuredVendor.social_media),
            JSON.stringify(structuredVendor.pricing_tier),
            JSON.stringify(structuredVendor.portfolio),
            JSON.stringify(structuredVendor.availability),
            JSON.stringify(structuredVendor.experience),
            JSON.stringify(structuredVendor.customization_options),
            JSON.stringify(structuredVendor.team_info),
            JSON.stringify(structuredVendor.logistics),
            JSON.stringify(structuredVendor.collaboration),
            vendorId
        ]);
        
        console.log('Vendor data updated with structured fields');
        
    } catch (error) {
        console.error('Error debugging vendor profile:', error);
    } finally {
        client.release();
        pool.end();
    }
}

debugVendorProfile();
