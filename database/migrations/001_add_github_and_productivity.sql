-- Migration 001: adds the pieces needed for GitHub commit tracking, productivity
-- scoring, and project milestones on top of the pre-existing devpulse schema.
-- Safe to run against the current live database (additive only).

ALTER TABLE users
    ADD COLUMN github_username VARCHAR(100) NULL AFTER joining_date;

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
