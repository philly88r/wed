-- Enable RLS on all tables
alter table venues enable row level security;
alter table table_templates enable row level security;
alter table seating_layouts enable row level security;
alter table table_instances enable row level security;
alter table guests enable row level security;

-- Add RLS policies for venues
create policy "venues_select" on venues
    for select using (created_by = auth.uid());
create policy "venues_insert" on venues
    for insert with check (created_by = auth.uid());
create policy "venues_update" on venues
    for update using (created_by = auth.uid());
create policy "venues_delete" on venues
    for delete using (created_by = auth.uid());

-- Add RLS policies for table_templates
create policy "table_templates_select" on table_templates
    for select using (created_by = auth.uid());
create policy "table_templates_insert" on table_templates
    for insert with check (created_by = auth.uid());
create policy "table_templates_update" on table_templates
    for update using (created_by = auth.uid());
create policy "table_templates_delete" on table_templates
    for delete using (created_by = auth.uid());

-- Add RLS policies for seating_layouts
create policy "seating_layouts_select" on seating_layouts
    for select using (created_by = auth.uid());
create policy "seating_layouts_insert" on seating_layouts
    for insert with check (created_by = auth.uid());
create policy "seating_layouts_update" on seating_layouts
    for update using (created_by = auth.uid());
create policy "seating_layouts_delete" on seating_layouts
    for delete using (created_by = auth.uid());

-- Add RLS policies for table_instances
create policy "table_instances_select" on table_instances
    for select using (created_by = auth.uid());
create policy "table_instances_insert" on table_instances
    for insert with check (created_by = auth.uid());
create policy "table_instances_update" on table_instances
    for update using (created_by = auth.uid());
create policy "table_instances_delete" on table_instances
    for delete using (created_by = auth.uid());

-- Add RLS policies for guests
create policy "guests_select" on guests
    for select using (created_by = auth.uid());
create policy "guests_insert" on guests
    for insert with check (created_by = auth.uid());
create policy "guests_update" on guests
    for update using (created_by = auth.uid());
create policy "guests_delete" on guests
    for delete using (created_by = auth.uid());
