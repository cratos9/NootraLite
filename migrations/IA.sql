# Tabla para guardar las consultas que los usuarios hacen a la IA, junto con sus respuestas y metadata. 25/04/2026
CREATE TABLE ia_queries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    
    user_id INT NOT NULL,
    notebook_id INT NULL,
    
    conversation_id VARCHAR(100),
    order_in_conversation INT,
    
    query_text TEXT NOT NULL,
    response_text TEXT,
    
    query_type VARCHAR(50),
    subject VARCHAR(100),
    language VARCHAR(20) DEFAULT 'es',
    
    tokens_used INT,
    response_time_ms INT,
    
    rating INT,
    is_helpful BOOLEAN,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_user_id (user_id),
    INDEX idx_conversation_id (conversation_id),
    INDEX idx_created_at (created_at),
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (notebook_id) REFERENCES notebooks(id) ON DELETE SET NULL
);