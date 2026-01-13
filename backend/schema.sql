CREATE TABLE IF NOT EXISTS tasks (
    id VARCHAR(255) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL,
    points INT NOT NULL,
    recurring VARCHAR(20) NOT NULL,
    due_date DATETIME,
    start_time VARCHAR(10),
    end_time VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS task_assignments (
    task_id VARCHAR(255),
    member_id VARCHAR(50),
    PRIMARY KEY (task_id, member_id),
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS completed_tasks (
    id VARCHAR(255) PRIMARY KEY,
    task_id VARCHAR(255),
    completed_by VARCHAR(50) NOT NULL,
    completed_at DATETIME NOT NULL,
    points_earned INT NOT NULL
);

CREATE TABLE IF NOT EXISTS point_rules (
    id VARCHAR(255) PRIMARY KEY,
    description TEXT NOT NULL,
    points INT NOT NULL,
    category VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS rewards (
    id VARCHAR(255) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    points_cost INT NOT NULL,
    emoji VARCHAR(10)
);

CREATE TABLE IF NOT EXISTS vincent_data (
    id INT PRIMARY KEY DEFAULT 1,
    bank_points INT DEFAULT 0,
    lifetime_points INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS big_goals (
    id VARCHAR(255) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    target_points INT NOT NULL,
    emoji VARCHAR(10),
    is_active BOOLEAN DEFAULT TRUE
);

-- Insert initial Vincent Data if not exists
INSERT IGNORE INTO vincent_data (id, bank_points, lifetime_points) VALUES (1, 0, 0);
