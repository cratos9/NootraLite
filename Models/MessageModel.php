<?php

class MessageModel {
    private $db;

    public function __construct($db) {
        $this->db = $db;
    }

    // lista de conversaciones del usuario con ultimo mensaje y no leidos
    public function getConversations($uid) {
        $sql = "SELECT c.id, c.user1_id, c.user2_id,
                       m.body AS last_msg, m.created_at AS last_time,
                       u.name AS other_name,
                       (SELECT COUNT(*) FROM messages
                        WHERE conversation_id = c.id AND sender_id != ? AND is_read = 0) AS unread
                FROM conversations c
                LEFT JOIN messages m ON m.id = (
                    SELECT id FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1
                )
                LEFT JOIN users u ON u.id = IF(c.user1_id = ?, c.user2_id, c.user1_id)
                WHERE c.user1_id = ? OR c.user2_id = ?
                ORDER BY last_time DESC";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$uid, $uid, $uid, $uid]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getMessages($conv_id) {
        $stmt = $this->db->prepare(
            'SELECT id, conversation_id, sender_id, body,
                    attachment_url, attachment_type, is_read, created_at
             FROM messages WHERE conversation_id = ? ORDER BY created_at ASC'
        );
        $stmt->execute([$conv_id]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function send($conv_id, $sender_id, $body, $att_url = null, $att_type = null) {
        $stmt = $this->db->prepare(
            'INSERT INTO messages (conversation_id, sender_id, body, attachment_url, attachment_type)
             VALUES (?, ?, ?, ?, ?)'
        );
        $stmt->execute([$conv_id, $sender_id, $body, $att_url, $att_type]);
        return $this->db->lastInsertId();
    }

    public function markRead($conv_id, $uid) {
        $stmt = $this->db->prepare(
            'UPDATE messages SET is_read = 1 WHERE conversation_id = ? AND sender_id != ?'
        );
        $stmt->execute([$conv_id, $uid]);
    }

    public function getUnreadCount($uid) {
        $stmt = $this->db->prepare(
            'SELECT COUNT(*) FROM messages m
             JOIN conversations c ON c.id = m.conversation_id
             WHERE (c.user1_id = ? OR c.user2_id = ?) AND m.sender_id != ? AND m.is_read = 0'
        );
        $stmt->execute([$uid, $uid, $uid]);
        return (int)$stmt->fetchColumn();
    }

    public function createConversation($uid1, $uid2) {
        $a = min($uid1, $uid2);
        $b = max($uid1, $uid2);
        $stmt = $this->db->prepare(
            'INSERT IGNORE INTO conversations (user1_id, user2_id) VALUES (?, ?)'
        );
        $stmt->execute([$a, $b]);
        $stmt2 = $this->db->prepare(
            'SELECT id FROM conversations WHERE user1_id = ? AND user2_id = ?'
        );
        $stmt2->execute([$a, $b]);
        return $stmt2->fetchColumn();
    }
}
?>
