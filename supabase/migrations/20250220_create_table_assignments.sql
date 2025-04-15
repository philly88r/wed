-- Create table assignments
create table if not exists public.table_assignments (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) not null,
    guest_id uuid references guests(id) not null,
    table_id uuid references table_templates(id) not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(guest_id) -- ensure a guest can only be assigned to one table
);

-- Add RLS policies for table assignments
alter table public.table_assignments enable row level security;

create policy "Users can view their own table assignments"
    on public.table_assignments for select
    using (auth.uid() = user_id);

create policy "Users can insert their own table assignments"
    on public.table_assignments for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own table assignments"
    on public.table_assignments for update
    using (auth.uid() = user_id);

create policy "Users can delete their own table assignments"
    on public.table_assignments for delete
    using (auth.uid() = user_id);

-- Add updated_at trigger
create trigger handle_table_assignments_updated_at
    before update on public.table_assignments
    for each row
    execute procedure public.handle_updated_at();
