-- Drop existing policies if they exist
drop policy if exists "Anyone can read comments" on public.comments;
drop policy if exists "Anyone can insert comments" on public.comments;
drop policy if exists "Anyone can update comments" on public.comments;

-- Make sure RLS is enabled
alter table public.comments enable row level security;

-- Create policies for anonymous access
create policy "Anyone can read comments"
on public.comments for select
using (true);

create policy "Anyone can insert comments"
on public.comments for insert
with check (true);

create policy "Anyone can update comments"
on public.comments for update
using (true);
