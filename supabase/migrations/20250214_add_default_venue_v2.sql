-- Insert a default venue for testing
insert into venues (name, address, created_by)
values 
    ('Grand Ballroom', '123 Main Street', (select id from auth.users limit 1)),
    ('Garden Terrace', '456 Park Avenue', (select id from auth.users limit 1))
on conflict do nothing;
