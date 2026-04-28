# Tabla para simular pagos de usuarios, pero solo guarda datos sin poder perjudicar a los usuarios. guardando solo informacion no sensible. 25/04/2026
CREATE TABLE fake_payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    
    user_id INT NOT NULL,
    
    card_holder_name VARCHAR(100),
    card_last4 VARCHAR(4), 
    card_type VARCHAR(20), 
    
    amount DECIMAL(10,2),
    currency VARCHAR(10) DEFAULT 'MXN',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_user_id (user_id),
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);