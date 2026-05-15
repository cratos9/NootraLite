<?php

require_once '../config/db.php';
require_once '../config/encrypt.php';

class Note{
    private $conn;

    public function __construct($db){
        $this->conn = $db;
    }

    public function getNotes($bookId, $userId){
        $query = "SELECT * FROM notes WHERE notebook_id = :book_id AND user_id = :user_id";
        $stmt = $this->conn->prepare($query);
        $stmt -> execute(['book_id' => $bookId, 'user_id' => $userId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function addNote($userId, $bookId, $title, $content, $wordCount){
        $title = encrypt_data($title);
        $content = encrypt_data($content);
        $sql = "INSERT INTO notes (user_id, notebook_id, title, content, word_count) VALUES (?, ?, ?, ?, ?)";
        $stmt = $this->conn->prepare($sql);
        return $stmt->execute([$userId, $bookId, $title, $content, $wordCount]);
    }

    public function getNoteById($noteId, $userId){
        $date = new DateTime();
        $query = "UPDATE notes SET last_accessed = :last_accessed WHERE id = :note_id AND user_id = :user_id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindValue(':last_accessed', $date->format('Y-m-d H:i:s'), PDO::PARAM_STR);
        $stmt->bindParam(':note_id', $noteId, PDO::PARAM_INT);
        $stmt->bindParam(':user_id', $userId, PDO::PARAM_INT);
        $stmt->execute();

        $query = "SELECT * FROM notes WHERE id = :note_id AND user_id = :user_id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':note_id', $noteId, PDO::PARAM_INT);
        $stmt->bindParam(':user_id', $userId, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function deleteNote($noteId, $userId){
        $query = "DELETE FROM notes WHERE id = :note_id AND user_id = :user_id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':note_id', $noteId, PDO::PARAM_INT);
        $stmt->bindParam(':user_id', $userId, PDO::PARAM_INT);
        return $stmt->execute();
    }

    public function updateNote($noteId, $userId, $title, $content, $wordCount){
        $title = encrypt_data($title);
        $content = encrypt_data($content);
        $sql = "UPDATE notes SET title = ?, content = ?, word_count = ? WHERE id = ? AND user_id = ?";
        $stmt = $this->conn->prepare($sql);
        return $stmt->execute([$title, $content, $wordCount, $noteId, $userId]);
    }

    public function getLastAccessedNotesByUserId($userId, $limit = 3){
        $query = "SELECT n.*, nb.color AS notebook_color, nb.title AS notebook_title FROM notes n LEFT JOIN notebooks nb ON nb.id = n.notebook_id WHERE n.user_id = :user_id ORDER BY n.last_accessed DESC LIMIT :limit";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':user_id', $userId, PDO::PARAM_INT);
        $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

}