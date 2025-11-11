-- IntelliCourse Academy Database Schema

CREATE DATABASE IF NOT EXISTS intellicourse_academy;
USE intellicourse_academy;

-- Users table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    country VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT TRUE,
    marketing_consent BOOLEAN DEFAULT FALSE,
    INDEX idx_email (email),
    INDEX idx_created_at (created_at)
);

-- Courses table
CREATE TABLE courses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    short_description VARCHAR(500),
    price DECIMAL(10,2) NOT NULL,
    original_price DECIMAL(10,2),
    category VARCHAR(100) NOT NULL,
    subcategory VARCHAR(100),
    level ENUM('beginner', 'intermediate', 'advanced') DEFAULT 'beginner',
    duration_hours INT DEFAULT 0,
    image_url VARCHAR(500),
    video_preview_url VARCHAR(500),
    download_url VARCHAR(500),
    file_size_mb DECIMAL(8,2),
    ai_optimized BOOLEAN DEFAULT TRUE,
    trending_score DECIMAL(5,2) DEFAULT 0,
    student_count INT DEFAULT 0,
    average_rating DECIMAL(3,2) DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_category (category),
    INDEX idx_price (price),
    INDEX idx_trending (trending_score DESC),
    INDEX idx_created_at (created_at DESC)
);

-- Course content table
CREATE TABLE course_content (
    id INT AUTO_INCREMENT PRIMARY KEY,
    course_id INT NOT NULL,
    module_number INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    content_type ENUM('video', 'pdf', 'quiz', 'interactive') DEFAULT 'video',
    content_url VARCHAR(500),
    duration_minutes INT DEFAULT 0,
    is_preview_available BOOLEAN DEFAULT FALSE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    INDEX idx_course_module (course_id, module_number)
);

-- Payments table
CREATE TABLE payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    course_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'ZAR',
    payment_method VARCHAR(50) NOT NULL,
    payment_gateway_id VARCHAR(255),
    status ENUM('pending', 'processing', 'completed', 'failed', 'refunded') DEFAULT 'pending',
    gateway_response TEXT,
    crypto_transaction_hash VARCHAR(255),
    eft_reference VARCHAR(100),
    proof_image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (course_id) REFERENCES courses(id),
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at),
    INDEX idx_payment_method (payment_method)
);

-- User courses (enrollments)
CREATE TABLE user_courses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    course_id INT NOT NULL,
    payment_id INT NOT NULL,
    access_granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    download_count INT DEFAULT 0,
    last_accessed TIMESTAMP NULL,
    completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP NULL,
    rating TINYINT,
    review_text TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (course_id) REFERENCES courses(id),
    FOREIGN KEY (payment_id) REFERENCES payments(id),
    UNIQUE KEY unique_user_course (user_id, course_id),
    INDEX idx_user_id (user_id),
    INDEX idx_course_id (course_id)
);

-- Revenue tracking table
CREATE TABLE revenue (
    id INT AUTO_INCREMENT PRIMARY KEY,
    date DATE NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'ZAR',
    source ENUM('course_sales', 'subscriptions', 'affiliate') DEFAULT 'course_sales',
    payment_method VARCHAR(50),
    course_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id),
    INDEX idx_date (date),
    INDEX idx_source (source)
);

-- Payout distribution table
CREATE TABLE payouts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    payment_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    recipient_type ENUM('fnb_account', 'african_bank', 'reserve_fund', 'ai_fund', 'accumulation') NOT NULL,
    percentage DECIMAL(5,2) NOT NULL,
    distributed_amount DECIMAL(10,2) NOT NULL,
    distributed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    transaction_reference VARCHAR(255),
    status ENUM('pending', 'processed', 'failed') DEFAULT 'pending',
    FOREIGN KEY (payment_id) REFERENCES payments(id),
    INDEX idx_recipient_type (recipient_type),
    INDEX idx_distributed_at (distributed_at)
);

-- AI Agents table
CREATE TABLE ai_agents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL,
    description TEXT,
    status ENUM('active', 'inactive', 'error', 'completed') DEFAULT 'inactive',
    target_value INT DEFAULT 0,
    current_value INT DEFAULT 0,
    progress_percentage DECIMAL(5,2) DEFAULT 0,
    success_rate DECIMAL(5,2) DEFAULT 0,
    efficiency_score DECIMAL(5,2) DEFAULT 0,
    accuracy_score DECIMAL(5,2) DEFAULT 0,
    configuration JSON,
    last_run TIMESTAMP NULL,
    next_run TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_type (type),
    INDEX idx_status (status)
);

-- AI Agent logs table
CREATE TABLE ai_agent_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    agent_id INT NOT NULL,
    level ENUM('info', 'warning', 'error') DEFAULT 'info',
    message TEXT NOT NULL,
    context JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (agent_id) REFERENCES ai_agents(id) ON DELETE CASCADE,
    INDEX idx_agent_id (agent_id),
    INDEX idx_level (level),
    INDEX idx_created_at (created_at DESC)
);

-- Marketing analytics table
CREATE TABLE marketing_analytics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    date DATE NOT NULL,
    platform VARCHAR(50) NOT NULL,
    campaign_name VARCHAR(255),
    impressions INT DEFAULT 0,
    clicks INT DEFAULT 0,
    conversions INT DEFAULT 0,
    cost DECIMAL(10,2) DEFAULT 0,
    revenue DECIMAL(12,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_date_platform (date, platform)
);

-- Currency exchange rates table
CREATE TABLE currency_rates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    base_currency VARCHAR(3) DEFAULT 'ZAR',
    target_currency VARCHAR(3) NOT NULL,
    exchange_rate DECIMAL(10,6) NOT NULL,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_currency_pair (base_currency, target_currency),
    INDEX idx_last_updated (last_updated DESC)
);

-- Chatbot conversations table
CREATE TABLE chatbot_conversations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    session_id VARCHAR(255) NOT NULL,
    user_message TEXT NOT NULL,
    bot_response TEXT NOT NULL,
    intent VARCHAR(100),
    confidence_score DECIMAL(4,3),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_session_id (session_id),
    INDEX idx_created_at (created_at)
);

-- System settings table
CREATE TABLE system_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(255) UNIQUE NOT NULL,
    setting_value TEXT NOT NULL,
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_setting_key (setting_key)
);

-- Insert initial data
INSERT INTO system_settings (setting_key, setting_value, description) VALUES
('payout_fnb_percentage', '40', 'Percentage of revenue to distribute to FNB account'),
('payout_african_bank_percentage', '10', 'Percentage of revenue to distribute to African Bank account'),
('payout_reserve_fund_percentage', '20', 'Percentage of revenue to distribute to reserve fund'),
('payout_ai_fund_percentage', '20', 'Percentage of revenue to distribute to AI development fund'),
('payout_accumulation_percentage', '10', 'Percentage of revenue to accumulate (not distributed)'),
('tax_threshold_amount', '91250', 'Annual tax-free threshold in ZAR'),
('target_monthly_revenue', '1000000', 'Monthly revenue target in ZAR'),
('student_acquisition_target', '2000', 'Target number of students to acquire in 7 days'),
('base_currency', 'ZAR', 'Base currency for the platform'),
('crypto_payment_discount', '5', 'Discount percentage for cryptocurrency payments');

-- Insert sample courses
INSERT INTO courses (title, description, short_description, price, original_price, category, level, duration_hours, image_url, ai_optimized, trending_score) VALUES
(
    'Strategic Intelligence & Deep Agents',
    'Master the art of creating AI systems that can strategize, plan, and execute complex tasks autonomously. Learn advanced techniques in machine learning, neural networks, and strategic decision-making algorithms.',
    'Build AI systems that strategize and execute complex tasks autonomously',
    499.00,
    799.00,
    'AI Agents',
    'advanced',
    15,
    'https://images.unsplash.com/photo-1677442136019-21780ecad995',
    TRUE,
    95.5
),
(
    'Creating AI Helpers for Complex Tasks',
    'Build AI assistants that can handle multi-step processes and decision-making in real-world scenarios. Learn natural language processing, task automation, and intelligent agent design.',
    'Create AI assistants for real-world multi-step processes',
    599.00,
    899.00,
    'Synthetic Intelligence',
    'intermediate',
    12,
    'https://images.unsplash.com/photo-1677442135339-6b5f64b059a7',
    TRUE,
    92.3
),
(
    'AI-Powered Marketing Materials',
    'Learn to create viral content, reels, and marketing assets using AI tools and automation systems. Master content generation, audience analysis, and performance optimization.',
    'Create viral marketing content using AI tools and automation',
    449.00,
    699.00,
    'Content Creation',
    'beginner',
    8,
    'https://images.unsplash.com/photo-1677442136015-d896a89a9d4c',
    TRUE,
    88.7
);

-- Insert initial AI agents
INSERT INTO ai_agents (name, type, description, status, target_value, current_value, progress_percentage, success_rate, efficiency_score, accuracy_score, configuration) VALUES
(
    'Student Acquisition Bot v1',
    'student_acquisition',
    'Automatically acquires new students through targeted marketing campaigns and AI-driven outreach',
    'active',
    2000,
    1300,
    65.0,
    87.5,
    92.0,
    89.5,
    '{"platforms": ["facebook", "instagram", "tiktok"], "daily_budget": 5000, "targeting": {"age_range": [18, 45], "interests": ["technology", "education", "ai"]}}'
),
(
    'Content Creation Assistant',
    'content_creation',
    'Generates and optimizes marketing content, course materials, and social media posts',
    'active',
    50,
    47,
    94.0,
    95.2,
    88.5,
    91.3,
    '{"content_types": ["blog_posts", "social_media", "course_materials"], "tone": "professional", "languages": ["en"]}'
),
(
    'Social Media Auto-Poster',
    'social_posting',
    'Automatically posts content to social media platforms and engages with the audience',
    'active',
    100,
    45,
    45.0,
    92.8,
    85.7,
    93.1,
    '{"platforms": ["tiktok", "facebook", "instagram"], "schedule": "optimal_times", "auto_engage": true}'
);

-- Create views for common queries
CREATE VIEW daily_revenue AS
SELECT 
    DATE(created_at) as date,
    SUM(amount) as total_revenue,
    COUNT(*) as transaction_count,
    AVG(amount) as average_order_value
FROM payments 
WHERE status = 'completed'
GROUP BY DATE(created_at);

CREATE VIEW course_performance AS
SELECT 
    c.id,
    c.title,
    c.category,
    COUNT(uc.id) as total_enrollments,
    SUM(p.amount) as total_revenue,
    AVG(uc.rating) as average_rating
FROM courses c
LEFT JOIN user_courses uc ON c.id = uc.course_id
LEFT JOIN payments p ON uc.payment_id = p.id AND p.status = 'completed'
GROUP BY c.id, c.title, c.category;

CREATE VIEW agent_performance AS
SELECT 
    a.id,
    a.name,
    a.type,
    a.status,
    a.progress_percentage,
    a.success_rate,
    a.efficiency_score,
    a.accuracy_score,
    COUNT(l.id) as log_count,
    MAX(l.created_at) as last_log
FROM ai_agents a
LEFT JOIN ai_agent_logs l ON a.id = l.agent_id
GROUP BY a.id, a.name, a.type, a.status, a.progress_percentage, a.success_rate, a.efficiency_score, a.accuracy_score;
