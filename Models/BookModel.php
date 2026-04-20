<?php

require_once '../config/db.php';
require_once '../config/encrypt.php';

class Book{
    private $conn;

    public function __construct($db){
        $this->conn = $db;
    }

    public function getBooks($userId){
        $query = "SELECT * FROM notebooks WHERE user_id = :user_id";
        $stmt = $this->conn->prepare($query);
        $stmt -> execute(['user_id' => $userId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function addBook($userId, $title, $description, $color, $category, $semester, $tags){
    $title = encrypt_data($title);
    $description = encrypt_data($description);
    $tags = encrypt_data($tags);
    $category = encrypt_data($category);
    $sql = "INSERT INTO notebooks (user_id, title, description, color, category, semester, tags) VALUES (?, ?, ?, ?, ?, ?, ?)";
    $stmt = $this->conn->prepare($sql);
    return $stmt->execute([$userId, $title, $description, $color, $category, $semester, $tags]);
    }

    public function getBookById($bookId, $userId){
        $query = "SELECT * FROM notebooks WHERE id = :book_id AND user_id = :user_id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':book_id', $bookId, PDO::PARAM_INT);
        $stmt->bindParam(':user_id', $userId, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
}
?>