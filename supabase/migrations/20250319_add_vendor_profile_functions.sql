-- Function to update a vendor's profile
CREATE OR REPLACE FUNCTION update_vendor_profile(
    p_vendor_id UUID,
    p_name TEXT DEFAULT NULL,
    p_description TEXT DEFAULT NULL,
    p_category_id UUID DEFAULT NULL,
    p_location TEXT DEFAULT NULL,
    p_address JSONB DEFAULT NULL,
    p_contact_info JSONB DEFAULT NULL,
    p_hero_image_url TEXT DEFAULT NULL,
    p_gallery_images JSONB DEFAULT NULL,
    p_services_offered JSONB DEFAULT NULL,
    p_pricing_details JSONB DEFAULT NULL,
    p_business_hours JSONB DEFAULT NULL,
    p_social_media JSONB DEFAULT NULL,
    p_amenities TEXT[] DEFAULT NULL,
    p_faq JSONB DEFAULT NULL,
    p_is_super_vendor BOOLEAN DEFAULT NULL,
    p_payment_method TEXT DEFAULT NULL,
    p_payment_details JSONB DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
    v_result JSONB;
    v_current_super_vendor_id UUID;
    v_profile_completion INTEGER := 0;
    v_completion_count INTEGER := 0;
    v_completion_total INTEGER := 10; -- Total number of fields that count toward completion
    v_super_vendor_payment_id UUID;
    v_super_vendor_cost NUMERIC := 250.00; -- Cost for super vendor status
BEGIN
    -- Calculate profile completion percentage
    IF p_name IS NOT NULL AND p_name != '' THEN v_completion_count := v_completion_count + 1; END IF;
    IF p_description IS NOT NULL AND p_description != '' THEN v_completion_count := v_completion_count + 1; END IF;
    IF p_category_id IS NOT NULL THEN v_completion_count := v_completion_count + 1; END IF;
    IF p_location IS NOT NULL AND p_location != '' THEN v_completion_count := v_completion_count + 1; END IF;
    IF p_address IS NOT NULL AND p_address != '{}' THEN v_completion_count := v_completion_count + 1; END IF;
    IF p_contact_info IS NOT NULL AND p_contact_info != '{}' THEN v_completion_count := v_completion_count + 1; END IF;
    IF p_hero_image_url IS NOT NULL AND p_hero_image_url != '' THEN v_completion_count := v_completion_count + 1; END IF;
    IF p_services_offered IS NOT NULL AND p_services_offered != '[]' THEN v_completion_count := v_completion_count + 1; END IF;
    IF p_pricing_details IS NOT NULL AND p_pricing_details != '[]' THEN v_completion_count := v_completion_count + 1; END IF;
    IF p_business_hours IS NOT NULL AND p_business_hours != '{}' THEN v_completion_count := v_completion_count + 1; END IF;
    
    v_profile_completion := (v_completion_count::FLOAT / v_completion_total::FLOAT * 100)::INTEGER;
    
    -- Handle super vendor status
    IF p_is_super_vendor = TRUE THEN
        -- Check if there's already a super vendor in this category
        SELECT id INTO v_current_super_vendor_id
        FROM public.vendors
        WHERE category_id = COALESCE(p_category_id, (SELECT category_id FROM public.vendors WHERE id = p_vendor_id))
        AND id != p_vendor_id
        AND is_super_vendor = TRUE
        AND (super_vendor_until IS NULL OR super_vendor_until > NOW());
        
        IF v_current_super_vendor_id IS NOT NULL THEN
            RETURN jsonb_build_object(
                'success', FALSE,
                'message', 'There is already a super vendor in this category',
                'current_super_vendor_id', v_current_super_vendor_id
            );
        END IF;
        
        -- Create a payment record for super vendor status
        INSERT INTO public.super_vendor_payments (
            vendor_id,
            amount,
            payment_date,
            payment_method,
            payment_status,
            notes
        ) VALUES (
            p_vendor_id,
            v_super_vendor_cost,
            NOW(),
            COALESCE(p_payment_method, 'credit_card'),
            'pending',
            'Super vendor payment for ' || COALESCE(p_name, (SELECT name FROM public.vendors WHERE id = p_vendor_id))
        ) RETURNING id INTO v_super_vendor_payment_id;
    END IF;
    
    -- Update the vendor profile
    UPDATE public.vendors
    SET
        name = COALESCE(p_name, name),
        description = COALESCE(p_description, description),
        category_id = COALESCE(p_category_id, category_id),
        location = COALESCE(p_location, location),
        address = COALESCE(p_address, address),
        contact_info = COALESCE(p_contact_info, contact_info),
        hero_image_url = COALESCE(p_hero_image_url, hero_image_url),
        gallery_images = COALESCE(p_gallery_images, gallery_images),
        services_offered = COALESCE(p_services_offered, services_offered),
        pricing_details = COALESCE(p_pricing_details, pricing_details),
        business_hours = COALESCE(p_business_hours, business_hours),
        social_media = COALESCE(p_social_media, social_media),
        amenities = COALESCE(p_amenities, amenities),
        faq = COALESCE(p_faq, faq),
        is_super_vendor = COALESCE(p_is_super_vendor, is_super_vendor),
        super_vendor_until = CASE 
            WHEN p_is_super_vendor = TRUE THEN NOW() + INTERVAL '1 year'
            ELSE super_vendor_until
        END,
        form_submitted = TRUE,
        profile_completion_percentage = v_profile_completion,
        updated_at = NOW()
    WHERE id = p_vendor_id;
    
    -- Return success result
    SELECT jsonb_build_object(
        'success', TRUE,
        'vendor_id', p_vendor_id,
        'profile_completion', v_profile_completion,
        'is_super_vendor', COALESCE(p_is_super_vendor, (SELECT is_super_vendor FROM public.vendors WHERE id = p_vendor_id)),
        'super_vendor_payment_id', v_super_vendor_payment_id
    ) INTO v_result;
    
    RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- Function to mark a vendor form link as used
CREATE OR REPLACE FUNCTION mark_form_link_used(p_token TEXT) RETURNS BOOLEAN AS $$
DECLARE
    v_link_id UUID;
BEGIN
    -- Find the link and mark it as used
    UPDATE public.vendor_form_links
    SET is_used = TRUE, updated_at = NOW()
    WHERE token = p_token AND is_used = FALSE AND expires_at > NOW()
    RETURNING id INTO v_link_id;
    
    -- Return success or failure
    RETURN v_link_id IS NOT NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to process a super vendor payment
CREATE OR REPLACE FUNCTION process_super_vendor_payment(
    p_payment_id UUID,
    p_status TEXT,
    p_transaction_id TEXT DEFAULT NULL,
    p_notes TEXT DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
    v_vendor_id UUID;
    v_result JSONB;
BEGIN
    -- Update the payment status
    UPDATE public.super_vendor_payments
    SET 
        payment_status = p_status,
        notes = CASE WHEN p_notes IS NOT NULL THEN p_notes ELSE notes END,
        invoice_number = COALESCE(p_transaction_id, invoice_number),
        updated_at = NOW()
    WHERE id = p_payment_id
    RETURNING vendor_id INTO v_vendor_id;
    
    -- If payment is completed, update the vendor's super vendor status
    IF p_status = 'completed' AND v_vendor_id IS NOT NULL THEN
        UPDATE public.vendors
        SET 
            is_super_vendor = TRUE,
            super_vendor_until = NOW() + INTERVAL '1 year',
            updated_at = NOW()
        WHERE id = v_vendor_id;
    END IF;
    
    -- If payment failed, update the vendor's super vendor status
    IF p_status = 'failed' AND v_vendor_id IS NOT NULL THEN
        UPDATE public.vendors
        SET 
            is_super_vendor = FALSE,
            super_vendor_until = NULL,
            updated_at = NOW()
        WHERE id = v_vendor_id;
    END IF;
    
    -- Return result
    SELECT jsonb_build_object(
        'success', v_vendor_id IS NOT NULL,
        'payment_id', p_payment_id,
        'vendor_id', v_vendor_id,
        'status', p_status
    ) INTO v_result;
    
    RETURN v_result;
END;
$$ LANGUAGE plpgsql;
