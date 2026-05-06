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

# Agregar columnas de metadatos por usuario (favoritos, fijados, silenciados), 16/04/2026
ALTER TABLE conversations
  ADD COLUMN is_pinned_u1   TINYINT(1) DEFAULT 0,
  ADD COLUMN is_pinned_u2   TINYINT(1) DEFAULT 0,
  ADD COLUMN is_favorite_u1 TINYINT(1) DEFAULT 0,
  ADD COLUMN is_favorite_u2 TINYINT(1) DEFAULT 0,
  ADD COLUMN is_muted_u1    TINYINT(1) DEFAULT 0,
  ADD COLUMN is_muted_u2    TINYINT(1) DEFAULT 0;

# Soporte para replies (responder a mensaje), 21/04/2026
ALTER TABLE messages
  ADD COLUMN reply_to_id INT NULL AFTER is_read,
  ADD CONSTRAINT fk_reply_to FOREIGN KEY (reply_to_id) REFERENCES messages(id) ON DELETE SET NULL;

# Marcar no leído forzado y tabla de bloqueos, 23/04/2026
ALTER TABLE conversations
  ADD COLUMN force_unread_u1 TINYINT(1) DEFAULT 0,
  ADD COLUMN force_unread_u2 TINYINT(1) DEFAULT 0;

CREATE TABLE IF NOT EXISTS blocked_users (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  blocker_id INT NOT NULL,
  blocked_id INT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_block (blocker_id, blocked_id)
);

# Tabla de reportes para mensajes y conversaciones, 24/04/2026
CREATE TABLE IF NOT EXISTS reports (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  reporter_id INT NOT NULL,
  target_type ENUM('message','conversation') NOT NULL,
  target_id   INT NOT NULL,
  reason      VARCHAR(255) DEFAULT NULL,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_reporter (reporter_id)
);

# Pin de mensaje en conversación y tabla de bookmarks, 28/04/2026
ALTER TABLE conversations
  ADD COLUMN pinned_message_id INT NULL,
  ADD CONSTRAINT fk_pinned_msg FOREIGN KEY (pinned_message_id)
    REFERENCES messages(id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS message_bookmarks (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  user_id    INT NOT NULL,
  message_id INT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_bm (user_id, message_id),
  FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE
);

# Eliminar mensaje para mí / para todos, 30/04/2026
ALTER TABLE messages
  ADD COLUMN deleted_for_sender   TINYINT(1) DEFAULT 0,
  ADD COLUMN deleted_for_receiver TINYINT(1) DEFAULT 0;

# Columnas typing para indicador escribiendo..., 01/05/2026
ALTER TABLE conversations
  ADD COLUMN typing_u1_at DATETIME NULL,
  ADD COLUMN typing_u2_at DATETIME NULL;

# Expandir ENUM attachment_type para location, audio y contacto, 05/05/2026
ALTER TABLE messages
  MODIFY COLUMN attachment_type ENUM('image','file','location','audio','contact') DEFAULT NULL;
