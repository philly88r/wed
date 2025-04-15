-- Create function to add default templates for a user
create or replace function add_default_templates_for_user(user_id uuid)
returns void as $$
begin
    insert into table_templates 
        (name, shape, width, length, seats, created_by)
    values 
        ('Round Table (8)', 'round', 5, 5, 8, user_id),
        ('Round Table (10)', 'round', 6, 6, 10, user_id),
        ('Round Table (12)', 'round', 7, 7, 12, user_id),
        ('Rectangular Table (8)', 'rectangular', 4, 8, 8, user_id),
        ('Rectangular Table (10)', 'rectangular', 4, 10, 10, user_id),
        ('Square Table (4)', 'square', 4, 4, 4, user_id),
        ('Square Table (8)', 'square', 6, 6, 8, user_id),
        ('Oval Table (12)', 'oval', 5, 12, 12, user_id),
        ('Head Table (16)', 'rectangular', 4, 16, 16, user_id),
        ('Sweetheart Table', 'rectangular', 3, 4, 2, user_id);
end;
$$ language plpgsql;
