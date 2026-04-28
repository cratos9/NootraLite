<?php

require_once '../config/encrypt.php';
require_once '../config/db.php';

class User{
    private $conn;

    public function __construct($db){
        $this->conn = $db;
    }

    public function CreateQuery($userId, $notebookId, $noteId, $conversationId, $orderInConversation, $queryText, $responseText, $queryType, $subject, $language, $tokensUsed, $responseTimeMs){

        $queryText = encrypt_data($queryText);
        $responseText = encrypt_data($responseText);
        $subject = encrypt_data($subject);
        $sql = "INSERT INTO ia_queries (user_id, notebook_id, note_id, conversation_id, order_in_conversation, query_text, response_text, query_type, subject, language, tokens_used, response_time_ms) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        $stmt = $this->conn->prepare($sql);
        return $stmt->execute([$userId, $notebookId, $noteId, $conversationId, $orderInConversation, $queryText, $responseText, $queryType, $subject, $language, $tokensUsed, $responseTimeMs]);
    }

    public function GetQueries($userId, $notebookId, $noteId){
        $sql = "SELECT * FROM ia_queries WHERE user_id = ? AND notebook_id = ? AND note_id = ? ORDER BY created_at DESC";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([$userId, $notebookId, $noteId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function DeleteQuery($conversationId, $userId){
        $sql = "DELETE FROM ia_queries WHERE conversation_id = ? AND user_id = ?";
        $stmt = $this->conn->prepare($sql);
        return $stmt->execute([$conversationId  , $userId]);
    }

    public function CalifyQuery($conversationId, $orderInConversation, $userId, $rating, $feedback, $isHelpful){
        $sql = "UPDATE ia_queries SET rating = ?, feedback = ?, is_helpful = ? WHERE conversation_id = ? AND order_in_conversation = ? AND user_id = ?";
        $stmt = $this->conn->prepare($sql);
        return $stmt->execute([$rating, $feedback, $isHelpful, $conversationId, $userId]);

}