<?php
$dbPath = __DIR__ . '/../database/nootra.db';

if (!is_dir(dirname($dbPath))) {
    mkdir(dirname($dbPath), 0755, true);
}

$pdo = new PDO('sqlite:' . $dbPath);
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

// crear tabla si no existe
$pdo->exec("CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL DEFAULT 1,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'pending',
    priority VARCHAR(20) DEFAULT 'medium',
    category VARCHAR(100),
    tags VARCHAR(300),
    start_datetime DATETIME NOT NULL,
    end_datetime DATETIME,
    all_day INTEGER DEFAULT 0,
    color VARCHAR(20),
    event_type VARCHAR(50),
    reminder_datetime DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME
)");

// datos de prueba si esta vacia
$count = $pdo->query("SELECT COUNT(*) FROM tasks")->fetchColumn();
if ($count == 0) {
    $seed = [
        [1, 'Quiz Química',        '2026-03-06 08:30:00', '#f87171'],
        [1, 'Entrega Lab. Física', '2026-03-10 09:00:00', '#34d399'],
        [1, 'Tarea Estadística',   '2026-03-14 23:59:00', '#fbbf24'],
        [1, 'Parcial Cálculo II',  '2026-03-18 11:00:00', '#f472b6'],
        [1, 'Entrega Prog. Web',   '2026-03-25 18:00:00', '#60a5fa'],
        [1, 'Exposición Historia', '2026-03-28 10:00:00', '#a78bfa'],
        [1, 'Examen Final Física', '2026-04-15 10:00:00', '#f87171'],
        [1, 'Proyecto Final Web',  '2026-04-22 18:00:00', '#60a5fa'],
        [1, 'Entrega Informe',     '2026-02-20 12:00:00', '#34d399'],
    ];
    $stmt = $pdo->prepare("INSERT INTO tasks (user_id, title, start_datetime, color) VALUES (?, ?, ?, ?)");
    foreach ($seed as $row) {
        $stmt->execute($row);
    }
}
