# tabla para gestionar las suscripciones de los usuarios. 25/04/2026 
CREATE TABLE subscriptions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    
    plan_type VARCHAR(50) NOT NULL DEFAULT 'free',
    status VARCHAR(20) NOT NULL DEFAULT 'active', 
    
    monthly_query_limit INT NOT NULL DEFAULT 100,
    queries_used INT NOT NULL DEFAULT 0,
    
    max_notebooks INT NOT NULL DEFAULT 10,
    max_notes_per_notebook INT NOT NULL DEFAULT 20,
    max_attachments_per_note INT NOT NULL DEFAULT 5,
    
    start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_date TIMESTAMP NULL,
    renewal_date TIMESTAMP NULL,
    
    last_payment_date TIMESTAMP NULL,
    next_payment_date TIMESTAMP NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_user_id (user_id),
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);