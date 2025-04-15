import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
    connectionString: 'postgresql://postgres:Yitbos88@db.yemkduykvfdjmldxfphq.supabase.co:5432/postgres',
    ssl: {
        rejectUnauthorized: false
    }
});

async function updateVendorProfiles() {
    try {
        console.log('Starting vendor profile updates...');
        
        const { rows: vendors } = await pool.query('SELECT id, name, category_id, location FROM vendors');
        let updatedCount = 0;

        for (const vendor of vendors) {
            const defaultProfile = {
                description: `${vendor.name} is a premier wedding vendor based in ${vendor.location}. With years of experience in the wedding industry, we are dedicated to making your special day unforgettable.`,
                contact_info: {
                    email: `contact@${vendor.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
                    phone: "(555) 123-4567",
                    website: `https://www.${vendor.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`
                },
                social_media: {
                    instagram: `https://instagram.com/${vendor.name.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
                    facebook: `https://facebook.com/${vendor.name.toLowerCase().replace(/[^a-z0-9]/g, '')}`
                },
                is_featured: Math.random() < 0.2, // 20% chance of being featured
                gallery_images: [
                    { url: 'https://source.unsplash.com/1600x900/?wedding' },
                    { url: 'https://source.unsplash.com/1600x900/?bride' },
                    { url: 'https://source.unsplash.com/1600x900/?celebration' }
                ],
                pricing_details: {
                    tier: ['budget', 'moderate', 'luxury'][Math.floor(Math.random() * 3)],
                    packages: [
                        {
                            name: 'Basic Package',
                            price: 2500 + Math.floor(Math.random() * 2500),
                            description: 'Perfect for intimate weddings',
                            includes: ['Basic service coverage', 'Standard features', 'Digital delivery']
                        },
                        {
                            name: 'Premium Package',
                            price: 5000 + Math.floor(Math.random() * 5000),
                            description: 'Our most popular option',
                            includes: ['Extended service coverage', 'Premium features', 'Digital & physical delivery', 'Additional services']
                        },
                        {
                            name: 'Luxury Package',
                            price: 8000 + Math.floor(Math.random() * 7000),
                            description: 'The ultimate wedding experience',
                            includes: ['Full service coverage', 'All premium features', 'Customized delivery', 'VIP treatment', 'Exclusive add-ons']
                        }
                    ],
                    price_range: {
                        min: 2500,
                        max: 15000,
                        currency: 'USD'
                    },
                    deposit_required: {
                        percentage: 25,
                        amount: 1000,
                        currency: 'USD'
                    },
                    payment_methods: ['Credit Card', 'Bank Transfer', 'Cash', 'Check'],
                    cancellation_policy: 'Full refund up to 60 days before the event. 50% refund up to 30 days before the event.'
                },
                availability: {
                    lead_time_days: 90,
                    peak_season: ['June', 'July', 'August', 'September'],
                    off_peak_season: ['November', 'December', 'January', 'February'],
                    travel_zones: [
                        {
                            zone: 'Local',
                            radius_miles: 25,
                            fee: 0
                        },
                        {
                            zone: 'Regional',
                            radius_miles: 100,
                            fee: 250
                        },
                        {
                            zone: 'Out of State',
                            radius_miles: 500,
                            fee: 1000
                        }
                    ]
                },
                services_offered: [
                    {
                        name: 'Standard Service',
                        description: 'Our basic service package',
                        duration_hours: 4,
                        price_range: {
                            min: 2500,
                            max: 5000,
                            currency: 'USD'
                        }
                    },
                    {
                        name: 'Premium Service',
                        description: 'Enhanced service with additional features',
                        duration_hours: 6,
                        price_range: {
                            min: 5000,
                            max: 8000,
                            currency: 'USD'
                        }
                    },
                    {
                        name: 'Luxury Service',
                        description: 'All-inclusive premium service',
                        duration_hours: 8,
                        price_range: {
                            min: 8000,
                            max: 15000,
                            currency: 'USD'
                        }
                    }
                ],
                amenities: [
                    'Free Consultation',
                    'Custom Packages',
                    'Online Booking',
                    'Digital Payment',
                    'Insurance Coverage'
                ],
                faq: [
                    {
                        question: 'What is your booking process?',
                        answer: 'Our booking process starts with a free consultation, followed by a proposal and contract. We require a deposit to secure your date.'
                    },
                    {
                        question: 'What is your cancellation policy?',
                        answer: 'We offer full refunds up to 60 days before the event, and 50% refunds up to 30 days before the event.'
                    },
                    {
                        question: 'Do you offer payment plans?',
                        answer: 'Yes, we offer flexible payment plans that can be customized to your needs.'
                    }
                ]
            };

            // Update the vendor profile
            await pool.query(
                `UPDATE vendors 
                SET 
                    description = $1,
                    contact_info = $2,
                    social_media = $3,
                    is_featured = $4,
                    gallery_images = $5,
                    pricing_details = $6,
                    availability = $7,
                    services_offered = $8,
                    amenities = $9,
                    faq = $10,
                    updated_at = NOW()
                WHERE id = $11
                RETURNING name, slug;`,
                [
                    defaultProfile.description,
                    defaultProfile.contact_info,
                    defaultProfile.social_media,
                    defaultProfile.is_featured,
                    defaultProfile.gallery_images,
                    defaultProfile.pricing_details,
                    defaultProfile.availability,
                    defaultProfile.services_offered,
                    defaultProfile.amenities,
                    defaultProfile.faq,
                    vendor.id
                ]
            );

            console.log(`[${++updatedCount}] Updated profile for: ${vendor.name}`);
        }

        console.log(`\nProfile updates complete! Updated ${updatedCount} vendors.`);

    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await pool.end();
    }
}

updateVendorProfiles();
