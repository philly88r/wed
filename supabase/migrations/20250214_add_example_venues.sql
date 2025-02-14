-- Insert example venues for the current user
insert into venues (name, address, created_by)
select 
    'Grand Ballroom',
    '123 Main Street, City, State',
    auth.uid()
where 
    not exists (
        select 1 
        from venues 
        where created_by = auth.uid()
    );

insert into venues (name, address, created_by)
select 
    'Garden Terrace',
    '456 Park Avenue, City, State',
    auth.uid()
where 
    not exists (
        select 1 
        from venues 
        where created_by = auth.uid()
    );
