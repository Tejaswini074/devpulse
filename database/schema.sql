-- DevPulse database schema
-- This mirrors the live schema already running against the local `devpulse` MySQL database
-- (originally created directly against MySQL; this file captures it for fresh installs / version control).
-- Run: CREATE DATABASE IF NOT EXISTS devpulse; USE devpulse; SOURCE schema.sql;
-- For an existing database that already has these tables, use database/migrations/ instead.

SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================
-- organizations
-- ============================================================
CREATE TABLE IF NOT EXISTS organizations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    organization_code VARCHAR(30) NOT NULL UNIQUE,
    organization_name VARCHAR(200) NOT NULL,
    email VARCHAR(150) NULL,
    phone VARCHAR(30) NULL,
    website VARCHAR(200) NULL,
    address TEXT NULL,
    logo VARCHAR(500) NULL,
    status ENUM('Active', 'Inactive') DEFAULT 'Active',
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- users  (team_id FK added after `teams` exists, see below)
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    organization_id INT NOT NULL,
    team_id INT NULL,
    employee_code VARCHAR(30) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NULL,
    role ENUM('Super Admin', 'Admin', 'Manager', 'Developer', 'Tester') DEFAULT 'Developer',
    designation VARCHAR(100) NULL,
    department VARCHAR(100) NULL,
    joining_date DATE NULL,
    github_username VARCHAR(100) NULL,
    profile_photo VARCHAR(500) NULL,
    status ENUM('Pending', 'Active', 'Inactive') DEFAULT 'Pending',
    last_login DATETIME NULL,
    last_login_ip VARCHAR(50) NULL,
    password_changed_at DATETIME NULL,
    failed_login_attempts INT DEFAULT 0,
    account_locked_until DATETIME NULL,
    created_by INT NULL,
    updated_by INT NULL,
    is_deleted TINYINT(1) DEFAULT 0,
    deleted_at DATETIME NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    invite_token VARCHAR(255) NULL,
    invite_expires_at DATETIME NULL,
    invite_accepted TINYINT(1) DEFAULT 0,
    refresh_token VARCHAR(500) NULL,
    INDEX idx_user_employee (employee_code),
    INDEX idx_user_email (email),
    INDEX idx_org (organization_id),
    CONSTRAINT fk_user_organization FOREIGN KEY (organization_id) REFERENCES organizations(id),
    CONSTRAINT fk_user_created_by FOREIGN KEY (created_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- teams
-- ============================================================
CREATE TABLE IF NOT EXISTS teams (
    id INT PRIMARY KEY AUTO_INCREMENT,
    organization_id INT NOT NULL,
    team_name VARCHAR(100) NOT NULL,
    description TEXT NULL,
    manager_id INT NULL,
    status ENUM('Active', 'Inactive') DEFAULT 'Active',
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_team_manager (manager_id),
    CONSTRAINT fk_team_organization FOREIGN KEY (organization_id) REFERENCES organizations(id),
    CONSTRAINT fk_team_manager FOREIGN KEY (manager_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

ALTER TABLE users
    ADD CONSTRAINT fk_user_team FOREIGN KEY (team_id) REFERENCES teams(id);

-- ============================================================
-- password_reset_tokens
-- ============================================================
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    token VARCHAR(255) NOT NULL,
    expires_at DATETIME NOT NULL,
    used TINYINT(1) DEFAULT 0,
    used_at DATETIME NULL,
    created_ip VARCHAR(50) NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_token (token),
    INDEX idx_user (user_id),
    CONSTRAINT fk_prt_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- user_sessions
-- ============================================================
CREATE TABLE IF NOT EXISTS user_sessions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    refresh_token TEXT NOT NULL,
    device_name VARCHAR(150) NULL,
    browser VARCHAR(100) NULL,
    ip_address VARCHAR(50) NULL,
    expires_at DATETIME NULL,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_session_user FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- invitation_logs
-- ============================================================
CREATE TABLE IF NOT EXISTS invitation_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    invited_by INT NOT NULL,
    email VARCHAR(150) NOT NULL,
    token VARCHAR(255) NULL,
    status ENUM('Pending', 'Accepted', 'Expired', 'Cancelled') DEFAULT 'Pending',
    expires_at DATETIME NULL,
    accepted_at DATETIME NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_invitationlog_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_invitationlog_invited_by FOREIGN KEY (invited_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- projects
-- ============================================================
CREATE TABLE IF NOT EXISTS projects (
    id INT PRIMARY KEY AUTO_INCREMENT,
    organization_id INT NOT NULL,
    project_code VARCHAR(30) NOT NULL UNIQUE,
    project_name VARCHAR(200) NOT NULL,
    description TEXT NULL,
    project_type ENUM('Internal', 'Client', 'Research') DEFAULT 'Internal',
    client_name VARCHAR(150) NULL,
    status ENUM('Planned', 'Active', 'Completed', 'On Hold', 'Cancelled') DEFAULT 'Planned',
    priority ENUM('Low', 'Medium', 'High', 'Critical') DEFAULT 'Medium',
    progress INT DEFAULT 0,
    budget DECIMAL(12,2) DEFAULT 0.00,
    start_date DATE NULL,
    end_date DATE NULL,
    project_manager INT NOT NULL,
    created_by INT NULL,
    updated_by INT NULL,
    is_deleted TINYINT(1) DEFAULT 0,
    deleted_at DATETIME NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_project_status (status),
    INDEX idx_project_manager (project_manager),
    INDEX idx_project_org (organization_id),
    CONSTRAINT fk_project_organization FOREIGN KEY (organization_id) REFERENCES organizations(id),
    CONSTRAINT fk_project_manager FOREIGN KEY (project_manager) REFERENCES users(id),
    CONSTRAINT fk_project_created_by FOREIGN KEY (created_by) REFERENCES users(id),
    CONSTRAINT fk_project_updated_by FOREIGN KEY (updated_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- project_members
-- ============================================================
CREATE TABLE IF NOT EXISTS project_members (
    id INT PRIMARY KEY AUTO_INCREMENT,
    project_id INT NOT NULL,
    user_id INT NOT NULL,
    member_role ENUM('Project Manager', 'Developer', 'Tester', 'UI/UX', 'Business Analyst') DEFAULT 'Developer',
    allocation_percentage INT DEFAULT 100,
    joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    left_at DATETIME NULL,
    status ENUM('Active', 'Removed') DEFAULT 'Active',
    assigned_by INT NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_project_member (project_id, user_id),
    INDEX idx_member_project (project_id),
    INDEX idx_member_user (user_id),
    CONSTRAINT fk_pm_project FOREIGN KEY (project_id) REFERENCES projects(id),
    CONSTRAINT fk_pm_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_pm_assigned_by FOREIGN KEY (assigned_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- sprints
-- ============================================================
CREATE TABLE IF NOT EXISTS sprints (
    id INT PRIMARY KEY AUTO_INCREMENT,
    project_id INT NOT NULL,
    sprint_name VARCHAR(100) NOT NULL,
    goal TEXT NULL,
    start_date DATE NULL,
    end_date DATE NULL,
    status ENUM('Planned', 'Active', 'Completed') DEFAULT 'Planned',
    created_by INT NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_sprint_project (project_id),
    CONSTRAINT fk_sprint_project FOREIGN KEY (project_id) REFERENCES projects(id),
    CONSTRAINT fk_sprint_created_by FOREIGN KEY (created_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- tasks
-- ============================================================
CREATE TABLE IF NOT EXISTS tasks (
    id INT PRIMARY KEY AUTO_INCREMENT,
    organization_id INT NOT NULL,
    task_code VARCHAR(30) NOT NULL UNIQUE,
    project_id INT NOT NULL,
    sprint_id INT NULL,
    parent_task_id INT NULL,
    assigned_to INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NULL,
    task_type ENUM('Story', 'Feature', 'Bug', 'Task', 'Research', 'Documentation') DEFAULT 'Task',
    priority ENUM('Low', 'Medium', 'High', 'Critical') DEFAULT 'Medium',
    severity ENUM('Low', 'Medium', 'High', 'Critical') DEFAULT 'Medium',
    status ENUM('Backlog', 'Todo', 'In Progress', 'Code Review', 'Testing', 'Done', 'Blocked') DEFAULT 'Backlog',
    story_points INT DEFAULT 0,
    progress INT DEFAULT 0,
    estimated_hours DECIMAL(6,2) NULL,
    actual_hours DECIMAL(6,2) DEFAULT 0.00,
    start_date DATE NULL,
    due_date DATE NULL,
    completed_date DATETIME NULL,
    created_by INT NULL,
    updated_by INT NULL,
    is_deleted TINYINT(1) DEFAULT 0,
    deleted_at DATETIME NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_task_project (project_id),
    INDEX idx_task_sprint (sprint_id),
    INDEX idx_task_assigned (assigned_to),
    INDEX idx_task_status (status),
    INDEX idx_task_priority (priority),
    INDEX idx_task_due_date (due_date),
    CONSTRAINT fk_task_organization FOREIGN KEY (organization_id) REFERENCES organizations(id),
    CONSTRAINT fk_task_project FOREIGN KEY (project_id) REFERENCES projects(id),
    CONSTRAINT fk_task_sprint FOREIGN KEY (sprint_id) REFERENCES sprints(id),
    CONSTRAINT fk_task_parent FOREIGN KEY (parent_task_id) REFERENCES tasks(id),
    CONSTRAINT fk_task_assigned_to FOREIGN KEY (assigned_to) REFERENCES users(id),
    CONSTRAINT fk_task_created_by FOREIGN KEY (created_by) REFERENCES users(id),
    CONSTRAINT fk_task_updated_by FOREIGN KEY (updated_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- task_comments
-- ============================================================
CREATE TABLE IF NOT EXISTS task_comments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    task_id INT NOT NULL,
    user_id INT NOT NULL,
    parent_comment_id INT NULL,
    comment TEXT NOT NULL,
    is_edited TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_comments_task (task_id),
    CONSTRAINT fk_comment_task FOREIGN KEY (task_id) REFERENCES tasks(id),
    CONSTRAINT fk_comment_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_comment_parent FOREIGN KEY (parent_comment_id) REFERENCES task_comments(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- task_history
-- ============================================================
CREATE TABLE IF NOT EXISTS task_history (
    id INT PRIMARY KEY AUTO_INCREMENT,
    task_id INT NOT NULL,
    changed_by INT NOT NULL,
    field_name VARCHAR(100) NULL,
    old_value TEXT NULL,
    new_value TEXT NULL,
    remarks TEXT NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_history_task (task_id),
    CONSTRAINT fk_history_task FOREIGN KEY (task_id) REFERENCES tasks(id),
    CONSTRAINT fk_history_changed_by FOREIGN KEY (changed_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- daily_logs
-- ============================================================
CREATE TABLE IF NOT EXISTS daily_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    log_code VARCHAR(30) NOT NULL UNIQUE,
    user_id INT NOT NULL,
    project_id INT NOT NULL,
    task_id INT NOT NULL,
    log_type ENUM('Development', 'Bug Fix', 'Testing', 'Meeting', 'Code Review', 'Research', 'Documentation', 'Deployment', 'Support') DEFAULT 'Development',
    hours_worked DECIMAL(5,2) NOT NULL,
    work_description TEXT NOT NULL,
    work_status ENUM('In Progress', 'Completed', 'Blocked') DEFAULT 'Completed',
    approval_status ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending',
    approved_by INT NULL,
    approved_at DATETIME NULL,
    approval_remarks TEXT NULL,
    is_billable TINYINT(1) DEFAULT 1,
    log_date DATE NOT NULL,
    start_time TIME NULL,
    end_time TIME NULL,
    created_by INT NULL,
    updated_by INT NULL,
    is_deleted TINYINT(1) DEFAULT 0,
    deleted_at DATETIME NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_dailylog_user (user_id),
    INDEX idx_dailylog_project (project_id),
    INDEX idx_dailylog_task (task_id),
    INDEX idx_dailylog_date (log_date),
    INDEX idx_dailylog_status (approval_status),
    CONSTRAINT fk_dailylog_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_dailylog_project FOREIGN KEY (project_id) REFERENCES projects(id),
    CONSTRAINT fk_dailylog_task FOREIGN KEY (task_id) REFERENCES tasks(id),
    CONSTRAINT fk_dailylog_approved_by FOREIGN KEY (approved_by) REFERENCES users(id),
    CONSTRAINT fk_dailylog_created_by FOREIGN KEY (created_by) REFERENCES users(id),
    CONSTRAINT fk_dailylog_updated_by FOREIGN KEY (updated_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- log_details
-- ============================================================
CREATE TABLE IF NOT EXISTS log_details (
    id INT PRIMARY KEY AUTO_INCREMENT,
    log_id INT NOT NULL UNIQUE,
    remarks TEXT NULL,
    work_location ENUM('Office', 'Remote', 'Client') DEFAULT 'Office',
    device_name VARCHAR(100) NULL,
    browser VARCHAR(100) NULL,
    operating_system VARCHAR(100) NULL,
    ip_address VARCHAR(50) NULL,
    duration_status ENUM('Normal', 'Half Day', 'Overtime') DEFAULT 'Normal',
    total_minutes INT DEFAULT 0,
    overtime_hours DECIMAL(5,2) DEFAULT 0.00,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_logdetail_log FOREIGN KEY (log_id) REFERENCES daily_logs(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- milestones  (new for V1 GitHub/productivity feature set)
-- ============================================================
CREATE TABLE IF NOT EXISTS milestones (
    id INT PRIMARY KEY AUTO_INCREMENT,
    project_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NULL,
    target_date DATE NULL,
    status ENUM('Pending', 'Completed') DEFAULT 'Pending',
    created_by INT NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_milestone_project (project_id),
    CONSTRAINT fk_milestone_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    CONSTRAINT fk_milestone_created_by FOREIGN KEY (created_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- github_activity  (new)
-- ============================================================
CREATE TABLE IF NOT EXISTS github_activity (
    id INT PRIMARY KEY AUTO_INCREMENT,
    organization_id INT NOT NULL,
    user_id INT NOT NULL,
    commit_count INT DEFAULT 0,
    pull_requests INT DEFAULT 0,
    issues_closed INT DEFAULT 0,
    activity_date DATE NOT NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_user_activity_date (user_id, activity_date),
    INDEX idx_github_org (organization_id),
    CONSTRAINT fk_github_organization FOREIGN KEY (organization_id) REFERENCES organizations(id),
    CONSTRAINT fk_github_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- productivity_scores  (new)
-- ============================================================
CREATE TABLE IF NOT EXISTS productivity_scores (
    id INT PRIMARY KEY AUTO_INCREMENT,
    organization_id INT NOT NULL,
    user_id INT NOT NULL,
    score DECIMAL(5,2) NOT NULL,
    week INT NOT NULL,
    month INT NOT NULL,
    year INT NOT NULL,
    calculated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_user_week (user_id, year, week),
    INDEX idx_score_org (organization_id),
    CONSTRAINT fk_score_organization FOREIGN KEY (organization_id) REFERENCES organizations(id),
    CONSTRAINT fk_score_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- leave_requests
-- ============================================================
CREATE TABLE IF NOT EXISTS leave_requests (
    id INT PRIMARY KEY AUTO_INCREMENT,
    organization_id INT NOT NULL,
    user_id INT NOT NULL,
    leave_type ENUM('Casual', 'Sick', 'Earned', 'Work From Home', 'Comp Off') NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_days DECIMAL(4,1) NULL,
    reason TEXT NULL,
    status ENUM('Pending', 'Approved', 'Rejected', 'Cancelled') DEFAULT 'Pending',
    approved_by INT NULL,
    approved_at DATETIME NULL,
    remarks TEXT NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_leave_user (user_id),
    INDEX idx_leave_status (status),
    CONSTRAINT fk_leave_organization FOREIGN KEY (organization_id) REFERENCES organizations(id),
    CONSTRAINT fk_leave_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_leave_approved_by FOREIGN KEY (approved_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- work_calendar
-- ============================================================
CREATE TABLE IF NOT EXISTS work_calendar (
    id INT PRIMARY KEY AUTO_INCREMENT,
    organization_id INT NOT NULL,
    calendar_date DATE NOT NULL,
    day_type ENUM('Working Day', 'Weekend', 'Holiday') DEFAULT 'Working Day',
    holiday_name VARCHAR(200) NULL,
    holiday_type ENUM('National', 'State', 'Company') DEFAULT 'Company',
    working_hours DECIMAL(4,2) DEFAULT 8.00,
    description TEXT NULL,
    created_by INT NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_org_calendar (organization_id, calendar_date),
    CONSTRAINT fk_calendar_organization FOREIGN KEY (organization_id) REFERENCES organizations(id),
    CONSTRAINT fk_calendar_created_by FOREIGN KEY (created_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- notifications
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    organization_id INT NOT NULL,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('Task', 'Project', 'Comment', 'Mention', 'Reminder', 'Approval', 'Leave', 'System') DEFAULT 'System',
    action_url VARCHAR(255) NULL,
    is_read TINYINT(1) DEFAULT 0,
    read_at DATETIME NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_notification_user (user_id),
    INDEX idx_notification_read (is_read),
    CONSTRAINT fk_notification_organization FOREIGN KEY (organization_id) REFERENCES organizations(id),
    CONSTRAINT fk_notification_user FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- activity_logs
-- ============================================================
CREATE TABLE IF NOT EXISTS activity_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    organization_id INT NOT NULL,
    user_id INT NULL,
    module_name VARCHAR(100) NULL,
    module_id INT NULL,
    action VARCHAR(100) NULL,
    description TEXT NULL,
    browser VARCHAR(100) NULL,
    device VARCHAR(100) NULL,
    ip_address VARCHAR(50) NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_activity_user (user_id),
    INDEX idx_activity_module (module_name, module_id),
    CONSTRAINT fk_activitylog_organization FOREIGN KEY (organization_id) REFERENCES organizations(id),
    CONSTRAINT fk_activitylog_user FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- app_settings
-- ============================================================
CREATE TABLE IF NOT EXISTS app_settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    organization_id INT NOT NULL,
    setting_key VARCHAR(100) NOT NULL,
    setting_value TEXT NULL,
    updated_by INT NULL,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_org_setting (organization_id, setting_key),
    CONSTRAINT fk_setting_organization FOREIGN KEY (organization_id) REFERENCES organizations(id),
    CONSTRAINT fk_setting_updated_by FOREIGN KEY (updated_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- attachments
-- ============================================================
CREATE TABLE IF NOT EXISTS attachments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    module_name ENUM('Project', 'Task', 'DailyLog') NOT NULL,
    record_id INT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT NULL,
    file_type VARCHAR(100) NULL,
    uploaded_by INT NOT NULL,
    is_deleted TINYINT(1) DEFAULT 0,
    uploaded_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_attachment_module (module_name, record_id),
    CONSTRAINT fk_attachment_uploaded_by FOREIGN KEY (uploaded_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SET FOREIGN_KEY_CHECKS = 1;
