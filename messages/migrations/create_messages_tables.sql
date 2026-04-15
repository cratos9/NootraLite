-- tablas del modulo de mensajes
-- ejecutar en la DB nootra

CREATE TABLE IF NOT EXISTS conversations (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  user1_id   INT NOT NULL,
  user2_id   INT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_conv (user1_id, user2_id)
);

CREATE TABLE IF NOT EXISTS messages (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  conversation_id INT NOT NULL,
  sender_id       INT NOT NULL,
  body            TEXT,
  attachment_url  VARCHAR(500) DEFAULT NULL,
  attachment_type ENUM('image','file') DEFAULT NULL,
  is_read         TINYINT(1) DEFAULT 0,
  created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
);
