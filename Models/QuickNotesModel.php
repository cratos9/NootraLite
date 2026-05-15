<?php

require_once '../config/encrypt.php';
require_once '../config/db.php';

class QuickNote{
    private $conn;

    public function __construct($db){
        $this->conn = $db;
    }

    public function Create($userId, $note, $color){
        $sql = "INSERT INTO quick_notes (user_id, note, color) VALUES (?, ?, ?)";
        $stmt = $this->conn->prepare($sql);
        return $stmt->execute([$userId, encrypt_data($note), $color]);
    }

    public function GetAllByUser($userId){
        $sql = "SELECT * FROM quick_notes WHERE user_id = ? ORDER BY created_at DESC";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([$userId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function Delete($noteId, $userId){
        $sql = "DELETE FROM quick_notes WHERE id = ? AND user_id = ?";
        $stmt = $this->conn->prepare($sql);
        return $stmt->execute([$noteId, $userId]);
    }

    public function GetLastThree($userId){
        $sql = "SELECT * FROM quick_notes WHERE user_id = ? ORDER BY created_at DESC LIMIT 3";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([$userId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}