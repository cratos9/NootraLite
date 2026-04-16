# Agregar campos para el restablecimiento de contraseña, 16/04/2026
ALTER TABLE users ADD COLUMN reset_token VARCHAR(255) NULL, ADD COLUMN reset_token_expiry DATETIME NULL;

# Quitar campo de is_active, 16/04/2026
ALTER TABLE users DROP COLUMN is_active;