<?php

require_once __DIR__ . '/../config/encrypt.php';
require_once __DIR__ . '/../config/db.php';

class TaskModel
{

    private $db;

    public function __construct($db){
        $this->db = $db;
    }

    // obtener todas las tareas del usuario
    public function getTasks($uid){
        $stmt = $this->db->prepare("SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at DESC");
        $stmt->execute([$uid]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    public function getTask($uid, $id){
        $stmt = $this->db->prepare("SELECT * FROM tasks WHERE user_id = ? AND id = ?");
        $stmt->execute([$uid, $id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    // crear tarea
    public function create( $uid, $title, $description, $priority, $category, $tags, $start_dt, $end_dt, $all_day, $color, $reminder_datetime, $evente_type) {
        $description = encrypt_data($description);
        $category = encrypt_data($category);
        $tags = encrypt_data($tags);
        $stmt = $this->db->prepare( "INSERT INTO tasks  (user_id, title, description, status, priority, category, tags, start_datetime, end_datetime, all_day)  VALUES (?, ?, ?, 'pending', ?, ?, ?, ?, ?, ?)" );
        $stmt->execute([ $uid, $title, $description, $priority, $category, $tags, $start_dt, $end_dt, $all_day]);
        return $this->db->lastInsertId();
    }

    // eliminar tarea
    public function delete($id, $uid){
        $stmt = $this->db->prepare( "DELETE FROM tasks WHERE id = ? AND user_id = ?");
        $stmt->execute([$id, $uid]);
        return $stmt->rowCount() > 0;
    }


    // actualizar tarea
    public function update( $id, $uid, $title, $description, $priority, $category, $tags, $start_dt, $end_dt, $all_day) {

        $title = encrypt_data($title);
        $description = encrypt_data($description);
        $category = encrypt_data($category);
        $tags = encrypt_data($tags);
        $stmt = $this->db->prepare( "UPDATE tasks SET  title = ?,  description = ?,  priority = ?,  category = ?,  tags = ?,  start_datetime = ?,  end_datetime = ?,  all_day = ? WHERE id = ? AND user_id = ?" );
        $stmt->execute([ $title, $description, $priority, $category, $tags, $start_dt, $end_dt, $all_day, $id, $uid]);
        return $stmt->rowCount() > 0;
    }

    // marcar como completada
    public function complete($id, $uid){
        $stmt = $this->db->prepare( "UPDATE tasks SET status = 'completed', completed_at = NOW()  WHERE id = ? AND user_id = ?");
        $stmt->execute([$id, $uid]);
        return $stmt->rowCount() > 0;
    }

    // obtener tareas pendientes
    public function getPending($uid) {
        $stmt = $this->db->prepare("SELECT * FROM tasks  WHERE user_id = ? AND status = 'pending'  ORDER BY start_datetime ASC");
        $stmt->execute([$uid]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // obtener tareas completadas
    public function getCompleted($uid){
        $stmt = $this->db->prepare("SELECT * FROM tasks  WHERE user_id = ? AND status = 'completed'  ORDER BY completed_at DESC");
        $stmt->execute([$uid]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}