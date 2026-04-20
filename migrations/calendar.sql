-- tablas del modulo de calendario
-- ejecutar en la DB nootra

# Agregar columna is_done para marcar eventos completados, 17/04/2026
ALTER TABLE tasks ADD COLUMN is_done TINYINT(1) DEFAULT 0 AFTER all_day;
