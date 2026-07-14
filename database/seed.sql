-- DevPulse seed data (for a FRESH database only — do not run against a DB that
-- already has organizations/users, it will create a duplicate org).
-- Admin login: admin@devpulse.com / Admin@123
-- Manager (team lead) login: rahul@devpulse.com / Admin@123
-- Developer login: priya@devpulse.com / Admin@123

INSERT INTO organizations (organization_code, organization_name, email, status) VALUES
('ORG-DEVPULSE', 'DevPulse Demo Company', 'admin@devpulse.com', 'Active');

SET @org_id = LAST_INSERT_ID();

INSERT INTO users
    (employee_code, organization_id, team_id, name, email, password, role, designation, department, joining_date, github_username, status, invite_accepted)
VALUES
    ('EMP-ADMIN001', @org_id, NULL, 'Admin User', 'admin@devpulse.com', '$2b$10$HLc5oq93i/D5qv7LBGs17umYcGzbzKZcRvPj6cwR5K4iZ/MaqEO4.', 'Admin', 'Founder', 'Management', CURDATE(), NULL, 'Active', 1);

SET @admin_id = LAST_INSERT_ID();

INSERT INTO teams (organization_id, team_name, manager_id, status) VALUES
(@org_id, 'Core Engineering', NULL, 'Active');

SET @team_id = LAST_INSERT_ID();

INSERT INTO users
    (employee_code, organization_id, team_id, name, email, password, role, designation, department, joining_date, github_username, status, invite_accepted)
VALUES
    ('EMP-LEAD0001', @org_id, @team_id, 'Rahul Sharma', 'rahul@devpulse.com', '$2b$10$HLc5oq93i/D5qv7LBGs17umYcGzbzKZcRvPj6cwR5K4iZ/MaqEO4.', 'Manager', 'Team Lead', 'Engineering', CURDATE(), 'octocat', 'Active', 1);

SET @rahul_id = LAST_INSERT_ID();

UPDATE teams SET manager_id = @rahul_id WHERE id = @team_id;

INSERT INTO users
    (employee_code, organization_id, team_id, name, email, password, role, designation, department, joining_date, github_username, status, invite_accepted)
VALUES
    ('EMP-DEV00001', @org_id, @team_id, 'Priya Verma', 'priya@devpulse.com', '$2b$10$HLc5oq93i/D5qv7LBGs17umYcGzbzKZcRvPj6cwR5K4iZ/MaqEO4.', 'Developer', 'Software Engineer', 'Engineering', CURDATE(), 'torvalds', 'Active', 1);

SET @priya_id = LAST_INSERT_ID();

INSERT INTO projects (organization_id, project_code, project_name, description, project_type, status, priority, progress, start_date, project_manager, created_by) VALUES
(@org_id, 'PRJ-TRAINING', 'Training Management System', 'Internal platform for tracking employee training sessions and certifications.', 'Internal', 'Active', 'High', 60, CURDATE() - INTERVAL 30 DAY, @rahul_id, @admin_id);

SET @project_id = LAST_INSERT_ID();

INSERT INTO project_members (project_id, user_id, member_role, assigned_by) VALUES
(@project_id, @rahul_id, 'Project Manager', @admin_id),
(@project_id, @priya_id, 'Developer', @admin_id);

INSERT INTO milestones (project_id, title, description, target_date, status, created_by) VALUES
(@project_id, 'Login Module', 'User authentication and session handling', CURDATE() - INTERVAL 20 DAY, 'Completed', @rahul_id),
(@project_id, 'Session Management', 'Track active sessions and timeouts', CURDATE() - INTERVAL 10 DAY, 'Completed', @rahul_id),
(@project_id, 'Attendance', 'Daily attendance capture module', CURDATE() - INTERVAL 2 DAY, 'Completed', @rahul_id),
(@project_id, 'Certificates', 'Auto-generate completion certificates', CURDATE() + INTERVAL 10 DAY, 'Pending', @rahul_id),
(@project_id, 'Reports', 'Admin reporting dashboard', CURDATE() + INTERVAL 20 DAY, 'Pending', @rahul_id);

INSERT INTO tasks (organization_id, task_code, project_id, assigned_to, title, description, task_type, status, priority, estimated_hours, actual_hours, due_date, created_by) VALUES
(@org_id, 'TSK-00001', @project_id, @priya_id, 'Attendance API', 'Build REST endpoints for marking and fetching attendance', 'Feature', 'Done', 'High', 8, 7.5, CURDATE() - INTERVAL 1 DAY, @rahul_id),
(@org_id, 'TSK-00002', @project_id, @priya_id, 'Session End Remark', 'Allow trainer to add remarks when a session ends', 'Feature', 'In Progress', 'Medium', 4, 2, CURDATE() + INTERVAL 2 DAY, @rahul_id),
(@org_id, 'TSK-00003', @project_id, @priya_id, 'Certificate Generation', 'Generate PDF certificates for completed trainees', 'Feature', 'Todo', 'Medium', 6, 0, CURDATE() + INTERVAL 7 DAY, @rahul_id),
(@org_id, 'TSK-00004', @project_id, @rahul_id, 'Dashboard Reports', 'Team lead dashboard with progress charts', 'Feature', 'Testing', 'High', 10, 9, CURDATE() + INTERVAL 3 DAY, @rahul_id);

INSERT INTO daily_logs (log_code, user_id, project_id, task_id, log_type, work_description, hours_worked, work_status, approval_status, log_date) VALUES
('LOG-00001', @priya_id, @project_id, 1, 'Development', 'Implemented attendance marking API', 5, 'Completed', 'Approved', CURDATE() - INTERVAL 6 DAY),
('LOG-00002', @priya_id, @project_id, 1, 'Development', 'Added attendance history endpoint + tests', 6, 'Completed', 'Approved', CURDATE() - INTERVAL 5 DAY),
('LOG-00003', @priya_id, @project_id, 2, 'Development', 'Started session end remark UI wiring', 8, 'In Progress', 'Approved', CURDATE() - INTERVAL 4 DAY),
('LOG-00004', @priya_id, @project_id, 2, 'Development', 'Backend validation for remarks', 7, 'Completed', 'Approved', CURDATE() - INTERVAL 3 DAY),
('LOG-00005', @priya_id, @project_id, 3, 'Research', 'Researched PDF generation library', 6, 'Completed', 'Approved', CURDATE() - INTERVAL 2 DAY),
('LOG-00006', @priya_id, @project_id, 3, 'Development', 'Drafted certificate template', 4, 'Completed', 'Pending', CURDATE() - INTERVAL 1 DAY),
('LOG-00007', @priya_id, @project_id, 3, 'Meeting', 'Reviewed certificate layout with lead', 2, 'Completed', 'Pending', CURDATE());

INSERT INTO github_activity (organization_id, user_id, commit_count, pull_requests, issues_closed, activity_date) VALUES
(@org_id, @priya_id, 8, 1, 0, CURDATE() - INTERVAL 6 DAY),
(@org_id, @priya_id, 5, 0, 1, CURDATE() - INTERVAL 5 DAY),
(@org_id, @priya_id, 12, 2, 0, CURDATE() - INTERVAL 4 DAY),
(@org_id, @priya_id, 7, 0, 1, CURDATE() - INTERVAL 3 DAY),
(@org_id, @priya_id, 6, 1, 0, CURDATE() - INTERVAL 2 DAY),
(@org_id, @priya_id, 4, 0, 0, CURDATE() - INTERVAL 1 DAY),
(@org_id, @priya_id, 2, 0, 0, CURDATE());
