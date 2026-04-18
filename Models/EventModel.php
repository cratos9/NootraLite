<?php

class EventModel {
    private $db;

    public function __construct($db) {
        $this->db = $db;
    }

    public function getAll($uid) {
        $stmt = $this->db->prepare(
            "SELECT id, title, color, start_datetime, all_day, is_done FROM tasks WHERE user_id = ? ORDER BY start_datetime"
        );
        $stmt->execute([$uid]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function create($uid, $title, $start_dt, $all_day, $color) {
        $stmt = $this->db->prepare(
            "INSERT INTO tasks (user_id, title, start_datetime, all_day, color) VALUES (?, ?, ?, ?, ?)"
        );
        $stmt->execute([$uid, $title, $start_dt, $all_day, $color]);
        return $this->db->lastInsertId();
    }

    public function delete($id, $uid) {
        $stmt = $this->db->prepare("DELETE FROM tasks WHERE id = ? AND user_id = ?");
        $stmt->execute([$id, $uid]);
        return $stmt->rowCount() > 0;
    }

    public function update($id, $uid, $title, $start_dt, $all_day, $color) {
        $stmt = $this->db->prepare(
            "UPDATE tasks SET title=?, start_datetime=?, all_day=?, color=? WHERE id=? AND user_id=?"
        );
        $stmt->execute([$title, $start_dt, $all_day, $color, $id, $uid]);
        return $stmt->rowCount() > 0;
    }
}
?>
