<?php

require_once '../config/db.php';
require_once '../config/encrypt.php';

class Book{
    private $conn;

    public function __construct($db){
        $this->conn = $db;
    }

    public function getBooks($userId){
        $query = "SELECT * FROM notebooks WHERE user_id = :user_id AND parent_id IS NULL ORDER BY created_at DESC";
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
        $date = new DateTime();
        $query = "UPDATE notebooks SET last_accessed = :last_accessed WHERE id = :book_id AND user_id = :user_id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindValue(':last_accessed', $date->format('Y-m-d H:i:s'), PDO::PARAM_STR);
        $stmt->bindParam(':book_id', $bookId, PDO::PARAM_INT);
        $stmt->bindParam(':user_id', $userId, PDO::PARAM_INT);
        $stmt->execute();

        $query = "SELECT * FROM notebooks WHERE id = :book_id AND user_id = :user_id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':book_id', $bookId, PDO::PARAM_INT);
        $stmt->bindParam(':user_id', $userId, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function deleteBook($bookId, $userId){
        $query = "DELETE FROM notebooks WHERE id = :book_id AND user_id = :user_id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':book_id', $bookId, PDO::PARAM_INT);
        $stmt->bindParam(':user_id', $userId, PDO::PARAM_INT);
        return $stmt->execute();
    }

    public function updateBook($bookId, $userId, $title, $description, $color, $category, $semester, $tags){
        $title = encrypt_data($title);
        $description = encrypt_data($description);
        $tags = encrypt_data($tags);
        $category = encrypt_data($category);
        $sql = "UPDATE notebooks SET title = ?, description = ?, color = ?, category = ?, semester = ?, tags = ? WHERE id = ? AND user_id = ?";
        $stmt = $this->conn->prepare($sql);
        return $stmt->execute([$title, $description, $color, $category, $semester, $tags, $bookId, $userId]);
    }

    public function addBookChildren($userId, $bookId, $title, $description, $color, $category, $semester, $tags){
        $title = encrypt_data($title);
        $description = encrypt_data($description);
        $tags = encrypt_data($tags);
        $category = encrypt_data($category);
        $sql = "INSERT INTO notebooks (user_id, parent_id, title, description, color, category, semester, tags) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        $stmt = $this->conn->prepare($sql);
        return $stmt->execute([$userId, $bookId, $title, $description, $color, $category, $semester, $tags]);
    }

    public function getBooksByParentId($parentId, $userId){
        $query = "SELECT * FROM notebooks WHERE parent_id = :parent_id AND user_id = :user_id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':parent_id', $parentId, PDO::PARAM_INT);
        $stmt->bindParam(':user_id', $userId, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getBookByParentId($parentId, $childBookId, $userId){
        $query = "SELECT * FROM notebooks WHERE parent_id = :parent_id AND id = :child_book_id AND user_id = :user_id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':parent_id', $parentId, PDO::PARAM_INT);
        $stmt->bindParam(':child_book_id', $childBookId, PDO::PARAM_INT);
        $stmt->bindParam(':user_id', $userId, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function deleteBookByParentId($parentId, $childBookId, $userId){
        $query = "DELETE FROM notebooks WHERE parent_id = :parent_id AND id = :child_book_id AND user_id = :user_id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':parent_id', $parentId, PDO::PARAM_INT);
        $stmt->bindParam(':child_book_id', $childBookId, PDO::PARAM_INT);
        $stmt->bindParam(':user_id', $userId, PDO::PARAM_INT);
        return $stmt->execute();
    }

    public function updateBookByParentId($parentId, $childBookId, $userId, $title, $description, $color, $category, $semester, $tags){
        $title = encrypt_data($title);
        $description = encrypt_data($description);
        $tags = encrypt_data($tags);
        $category = encrypt_data($category);
        $sql = "UPDATE notebooks SET title = ?, description = ?, color = ?, category = ?, semester = ?, tags = ? WHERE parent_id = ? AND id = ? AND user_id = ?";
        $stmt = $this->conn->prepare($sql);
        return $stmt->execute([$title, $description, $color, $category, $semester, $tags, $parentId, $childBookId, $userId]);
    }

    public function getLastAccessedBooksByUserId($userId, $limit = 3){
        $query = "SELECT * FROM notebooks WHERE user_id = :user_id ORDER BY last_accessed DESC LIMIT :limit";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':user_id', $userId, PDO::PARAM_INT);
        $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
?>