<?php

require_once '../config/db.php';
require_once '../config/encrypt.php';
require_once '../includes/attachments.php';

class AttachmentModel{
    private $conn;

    public function __construct($db){
        $this->conn = $db;
    }

    public function saveAttachment($user_id, $notebook_id, $filename, $original_filename, $file_path, $file_type, $file_size_bytes){
        $sql = "INSERT INTO attachments (user_id, notebook_id, filename, original_filename, file_path, file_type, file_size_bytes) VALUES (?, ?, ?, ?, ?, ?, ?)";
        $stmt = $this->conn->prepare($sql);
        return $stmt->execute([
            $user_id,
            $notebook_id,
            encrypt_data((string) $filename),
            encrypt_data((string) $original_filename),
            encrypt_data((string) $file_path),
            encrypt_data((string) $file_type),
            $file_size_bytes
        ]);
    }

    public function getAttachmentsByNotebookId($notebook_id, $user_id){
        $sql = "SELECT * FROM attachments WHERE notebook_id = ? AND user_id = ?";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([$notebook_id, $user_id]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getAttachmentByNotebookId($notebook_id, $user_id){
        $sql = "SELECT * FROM attachments WHERE notebook_id = ? AND user_id = ?";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([$notebook_id, $user_id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function getAttachmentById($attachment_id, $user_id){
        $sql = "SELECT * FROM attachments WHERE id = ? AND user_id = ? LIMIT 1";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([$attachment_id, $user_id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function deleteAttachment($attachment_id, $user_id){
        $sql = "DELETE FROM attachments WHERE id = ? AND user_id = ?";
        $stmt = $this->conn->prepare($sql);
        return $stmt->execute([$attachment_id, $user_id]);
    }
}

?>