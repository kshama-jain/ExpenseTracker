-- Create database
CREATE DATABASE IF NOT EXISTS expense_management;
USE expense_management;

-- Users table
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Expenses table
CREATE TABLE expenses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(100) NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Monthly budgets table
CREATE TABLE monthly_budgets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  month VARCHAR(7) NOT NULL, -- Format: YYYY-MM
  budget_amount DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_month (user_id, month)
);

-- Category budgets table
CREATE TABLE category_budgets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  category VARCHAR(100) NOT NULL,
  budget_limit DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_category (user_id, category)
);

-- Insert sample data
INSERT INTO users (name, email, password_hash) VALUES 
('Demo User', 'demo@example.com', '$2b$10$dummy.hash.for.demo.user'),
('John Doe', 'john@example.com', '$2b$10$dummy.hash.for.john.doe');

INSERT INTO expenses (user_id, amount, description, category, date) VALUES 
(1, 45.99, 'Grocery shopping at Whole Foods', 'Food & Dining', '2024-01-15'),
(1, 89.50, 'Gas station fill-up', 'Transportation', '2024-01-14'),
(1, 1200.00, 'Monthly rent payment', 'Housing', '2024-01-01');

INSERT INTO monthly_budgets (user_id, month, budget_amount) VALUES 
(1, '2024-01', 2500.00),
(1, '2024-02', 2500.00);

INSERT INTO category_budgets (user_id, category, budget_limit) VALUES 
(1, 'Food & Dining', 500.00),
(1, 'Transportation', 300.00),
(1, 'Housing', 1500.00),
(1, 'Entertainment', 200.00);
