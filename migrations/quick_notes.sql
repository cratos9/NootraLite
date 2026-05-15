#crear tabla para notas rápidas, 12/05/2026
CREATE TABLE quick_notes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    note TEXT NOT NULL,
    color VARCHAR(7) NOT NULL DEFAULT '#7c3aed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at),

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);