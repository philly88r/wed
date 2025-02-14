-- Create system templates table
create table system_table_templates (
    id uuid primary key default uuid_generate_v4(),
    name text not null,
    shape text not null check (shape in ('round', 'rectangular', 'square', 'oval')),
    width numeric not null,
    length numeric not null,
    seats integer not null,
    is_premium boolean default false,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Enable RLS
alter table system_table_templates enable row level security;

-- Allow all authenticated users to view templates
create policy "Users can view all system templates"
    on system_table_templates
    for select
    using (auth.role() = 'authenticated');

-- Insert system-wide templates
insert into system_table_templates 
    (name, shape, width, length, seats, is_premium)
values 
    ('Round Table (8)', 'round', 5, 5, 8, false),
    ('Round Table (10)', 'round', 6, 6, 10, false),
    ('Round Table (12)', 'round', 7, 7, 12, false),
    ('Rectangular Table (8)', 'rectangular', 4, 8, 8, false),
    ('Rectangular Table (10)', 'rectangular', 4, 10, 10, false),
    ('Square Table (4)', 'square', 4, 4, 4, false),
    ('Square Table (8)', 'square', 6, 6, 8, false),
    ('Oval Table (12)', 'oval', 5, 12, 12, true),
    ('Head Table (16)', 'rectangular', 4, 16, 16, true),
    ('Sweetheart Table', 'rectangular', 3, 4, 2, true);

-- Create function to copy template to user's layout
create or replace function copy_system_template_to_layout(
    template_id uuid,
    layout_id uuid,
    position_x numeric,
    position_y numeric
) returns uuid as $$
declare
    v_template system_table_templates;
    v_user_id uuid;
    v_new_instance_id uuid;
begin
    -- Get the template
    select * into v_template
    from system_table_templates
    where id = template_id;

    -- Get the current user
    v_user_id := auth.uid();

    -- Insert new table instance
    insert into table_instances (
        created_by,
        layout_id,
        name,
        position_x,
        position_y,
        rotation,
        width,
        length,
        seats,
        shape
    ) values (
        v_user_id,
        layout_id,
        v_template.name,
        position_x,
        position_y,
        0,
        v_template.width,
        v_template.length,
        v_template.seats,
        v_template.shape
    ) returning id into v_new_instance_id;

    return v_new_instance_id;
end;
$$ language plpgsql security definer;
