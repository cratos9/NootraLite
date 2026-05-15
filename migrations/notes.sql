# Agregar columna para la fecha de la ultima vista, 14/05/2026
ALTER TABLE notes ADD COLUMN last_accessed DATETIME NULL;