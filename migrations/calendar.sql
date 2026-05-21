-- tablas del modulo de calendario
-- ejecutar en la DB nootra

# Agregar columna is_done para marcar eventos completados, 17/04/2026
ALTER TABLE tasks ADD COLUMN is_done TINYINT(1) DEFAULT 0 AFTER all_day;

# Convención event_type para separar módulos, 20/05/2026
# El calendario guarda event_type = 'calendar' en cada INSERT (ya en EventModel.php)
# El módulo de tareas debe guardar event_type = 'task' en sus inserts
UPDATE tasks SET event_type = 'calendar' WHERE event_type IS NULL;
