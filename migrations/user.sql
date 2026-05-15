# Agregar campos para el restablecimiento de contraseña, 16/04/2026
ALTER TABLE users ADD COLUMN reset_token VARCHAR(255) NULL, ADD COLUMN reset_token_expiry DATETIME NULL;

# Quitar campo de is_active, 16/04/2026
ALTER TABLE users DROP COLUMN is_active;

# Agregar campo para la verificación de correo electrónico y su fecha de expiración, 19/04/2026
ALTER TABLE users ADD COLUMN verification_token VARCHAR(64) NULL, ADD COLUMN verification_token_expiry DATETIME NULL;

# Agregar columna plan para los niveles de suscripción del usuario, 01/05/2026
ALTER TABLE users ADD COLUMN plan ENUM('free','pro','mega') NOT NULL DEFAULT 'free';

# Eliminar columna plan de users — el plan vive en subscriptions.plan_type, 05/05/2026
ALTER TABLE users DROP COLUMN plan;

# Agregar columna para el estado de dos pasos, 14/05/2026
ALTER TABLE users ADD COLUMN is_two_factor BOOLEAN NOT NULL DEFAULT FALSE;