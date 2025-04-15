-- Insert default table templates
insert into table_templates 
    (name, shape, width, length, seats, created_by)
values 
    ('Round Table (8)', 'round', 5, 5, 8, auth.uid()),
    ('Round Table (10)', 'round', 6, 6, 10, auth.uid()),
    ('Round Table (12)', 'round', 7, 7, 12, auth.uid()),
    ('Rectangular Table (8)', 'rectangular', 4, 8, 8, auth.uid()),
    ('Rectangular Table (10)', 'rectangular', 4, 10, 10, auth.uid()),
    ('Square Table (4)', 'square', 4, 4, 4, auth.uid()),
    ('Square Table (8)', 'square', 6, 6, 8, auth.uid()),
    ('Oval Table (12)', 'oval', 5, 12, 12, auth.uid()),
    ('Head Table (16)', 'rectangular', 4, 16, 16, auth.uid()),
    ('Sweetheart Table', 'rectangular', 3, 4, 2, auth.uid());
