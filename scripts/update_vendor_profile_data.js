import pg from 'pg';
const { Pool } = pg;

// Database connection
const pool = new Pool({
  connectionString: 'postgresql://postgres:Yitbos88@db.kdhwrlhzevzekoanusbs.supabase.co:5432/postgres'
});

async function updateVendorData() {
  const client = await pool.connect();
  
  try {
    // Start a transaction
    await client.query('BEGIN');
    
    // Get the vendor with slug '501-union' (using a slug we know exists from our check)
    const vendorResult = await client.query(`
      SELECT id FROM vendors WHERE slug = '501-union'
    `);
    
    if (vendorResult.rows.length === 0) {
      console.log('Vendor "501-union" not found');
      return;
    }
    
    const vendorId = vendorResult.rows[0].id;
    
    // Update the vendor with more comprehensive data
    await client.query(`
      UPDATE vendors 
      SET 
        description = '501 Union is a premier wedding venue in Brooklyn, offering a perfect blend of historic charm and modern elegance. The restored 1916 warehouse features original details like concrete floors and exposed brick walls, complemented by contemporary amenities. Our versatile spaces include a main hall, cocktail lounge, and private suite, accommodating up to 160 guests for a seated dinner and dancing.',
        gallery_images = '[
          {"url": "https://images.unsplash.com/photo-1519741497674-611481863552", "caption": "Main hall setup for wedding reception", "order": 1},
          {"url": "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6", "caption": "Cocktail lounge area", "order": 2},
          {"url": "https://images.unsplash.com/photo-1519225421980-715cb0215aed", "caption": "Outdoor courtyard space", "order": 3}
        ]',
        social_media = '{
          "instagram": "@501union",
          "facebook": "facebook.com/501union"
        }',
        contact_info = '{
          "email": "events@501union.com",
          "phone": "(347) 763-1506",
          "website": "www.501union.com"
        }',
        pricing_details = '{
          "tier": "premium",
          "price_range": {
            "min": 15000,
            "max": 30000,
            "currency": "$"
          },
          "deposit_required": {
            "percentage": 50,
            "amount": 7500,
            "currency": "$"
          },
          "payment_methods": ["Credit Card", "Bank Transfer", "Check"],
          "cancellation_policy": "50% refund if cancelled 6+ months before event. 25% refund if cancelled 3-6 months before event. No refund if cancelled less than 3 months before event."
        }',
        business_hours = '{
          "monday": {"open": "09:00", "close": "17:00", "closed": false},
          "tuesday": {"open": "09:00", "close": "17:00", "closed": false},
          "wednesday": {"open": "09:00", "close": "17:00", "closed": false},
          "thursday": {"open": "09:00", "close": "17:00", "closed": false},
          "friday": {"open": "09:00", "close": "17:00", "closed": false},
          "saturday": {"open": "10:00", "close": "15:00", "closed": false},
          "sunday": {"open": null, "close": null, "closed": true},
          "notes": "Available for evening events 7 days a week. Tours by appointment only."
        }',
        services_offered = '[
          {
            "name": "Full Venue Rental",
            "description": "Exclusive use of all venue spaces including main hall, cocktail lounge, and private suite",
            "price_range": {"min": 15000, "max": 30000, "currency": "$"},
            "included": ["Tables and chairs for up to 160 guests", "Basic lighting package", "Sound system", "On-site venue manager", "Security staff"]
          },
          {
            "name": "Ceremony Only",
            "description": "Use of main hall for ceremony only (up to 3 hours)",
            "price_range": {"min": 5000, "max": 8000, "currency": "$"},
            "included": ["Ceremony seating for up to 160 guests", "Basic sound system", "On-site venue manager"]
          },
          {
            "name": "Cocktail Reception",
            "description": "Use of cocktail lounge for reception (up to 4 hours)",
            "price_range": {"min": 8000, "max": 12000, "currency": "$"},
            "included": ["Cocktail furniture setup", "Bar setup", "Basic lighting package", "On-site venue manager"]
          }
        ]',
        amenities = '{
          "parking": {"available": true, "details": "Limited street parking available. Nearby parking garage at 175 Smith Street."},
          "accessibility": {"wheelchair_accessible": true, "elevator": true},
          "catering": {"in_house": false, "preferred_vendors": true, "outside_allowed": true, "kitchen_facilities": true},
          "bar_service": {"in_house": true, "outside_allowed": true, "corkage_fee": true},
          "av_equipment": {"available": true, "details": "Basic sound system and microphones included. Additional AV equipment available for rent."},
          "wifi": {"available": true, "complimentary": true}
        }',
        faq = '[
          {
            "question": "What is the maximum capacity?",
            "answer": "We can accommodate up to 160 guests for a seated dinner with dancing, or up to 250 for a standing reception.",
            "category": "Venue"
          },
          {
            "question": "Do you have preferred vendors?",
            "answer": "We have a list of preferred vendors who are familiar with our space, but you are welcome to bring in your own vendors as well.",
            "category": "Planning"
          },
          {
            "question": "What is your payment schedule?",
            "answer": "We require a 50% deposit to secure your date, with the remaining balance due 30 days before your event.",
            "category": "Billing"
          },
          {
            "question": "Is there a getting ready space?",
            "answer": "Yes, our private suite is perfect for the wedding party to get ready before the ceremony.",
            "category": "Amenities"
          }
        ]'
      WHERE id = $1
    `, [vendorId]);
    
    // Commit the transaction
    await client.query('COMMIT');
    
    console.log('Successfully updated vendor data for "501-union"');
  } catch (error) {
    // Rollback in case of error
    await client.query('ROLLBACK');
    console.error('Error updating vendor data:', error);
  } finally {
    // Release the client back to the pool
    client.release();
    pool.end();
  }
}

updateVendorData();
