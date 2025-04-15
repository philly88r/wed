-- Insert a default venue if none exists
insert into venues (name, address, created_by)
select 
    'Grand Ballroom',
    '123 Main Street',
    auth.uid()
where 
    not exists (
        select 1 
        from venues 
        where created_by = auth.uid()
    );
