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
                       COALESCE(u.username, u.name) AS other_name,
                       u.id   AS other_user_id,
                       IF(TIMESTAMPDIFF(SECOND, u.last_seen, NOW()) < 45, 1, 0) AS is_online,
                       (SELECT COUNT(*) FROM messages
                        WHERE conversation_id = c.id AND sender_id != ? AND is_read = 0) AS unread,
                       IF(c.user1_id = ?, c.is_favorite_u1, c.is_favorite_u2)     AS is_favorite,
                       IF(c.user1_id = ?, c.is_pinned_u1,   c.is_pinned_u2)       AS is_pinned,
                       IF(c.user1_id = ?, c.is_muted_u1,    c.is_muted_u2)        AS is_muted,
                       IF(c.user1_id = ?, c.force_unread_u1, c.force_unread_u2)   AS force_unread,
                       (SELECT COUNT(*) FROM blocked_users
                        WHERE blocker_id = ? AND blocked_id = u.id)                AS is_blocked
                FROM conversations c
                LEFT JOIN messages m ON m.id = (
                    SELECT id FROM messages
                    WHERE conversation_id = c.id
                      AND NOT (sender_id = ? AND deleted_for_sender = 1)
                      AND NOT (sender_id != ? AND deleted_for_receiver = 1 AND deleted_for_sender = 0)
                    ORDER BY created_at DESC LIMIT 1
                )
                LEFT JOIN users u ON u.id = IF(c.user1_id = ?, c.user2_id, c.user1_id)
                WHERE c.user1_id = ? OR c.user2_id = ?
                ORDER BY last_time DESC";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$uid, $uid, $uid, $uid, $uid, $uid, $uid, $uid, $uid, $uid, $uid]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getMessages($conv_id, $uid) {
        $stmt = $this->db->prepare(
            'SELECT m.id, m.conversation_id, m.sender_id, m.body,
                    m.attachment_url, m.attachment_type, m.is_read, m.created_at,
                    m.reply_to_id,
                    r.body AS reply_body,
                    r.sender_id AS reply_sender_id,
                    r.attachment_type AS reply_attachment_type,
                    CASE WHEN m.deleted_for_sender = 1 AND m.deleted_for_receiver = 1 THEN 1 ELSE 0 END AS deleted_for_all
             FROM messages m
             LEFT JOIN messages r ON r.id = m.reply_to_id
             WHERE m.conversation_id = ?
               AND NOT (m.sender_id = ? AND m.deleted_for_sender = 1)
               AND NOT (m.sender_id != ? AND m.deleted_for_receiver = 1 AND m.deleted_for_sender = 0)
             ORDER BY m.created_at ASC'
        );
        $stmt->execute([$conv_id, $uid, $uid]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function send($conv_id, $sender_id, $body, $att_url = null, $att_type = null, $reply_to_id = null) {
        $stmt = $this->db->prepare(
            'INSERT INTO messages (conversation_id, sender_id, body, attachment_url, attachment_type, reply_to_id)
             VALUES (?, ?, ?, ?, ?, ?)'
        );
        $stmt->execute([$conv_id, $sender_id, $body, $att_url, $att_type, $reply_to_id]);
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

    public function updateLastSeen($uid) {
        $stmt = $this->db->prepare('UPDATE users SET last_seen = NOW() WHERE id = ?');
        $stmt->execute([$uid]);
    }

    // retorna is_online (1/0) del otro usuario en una conv
    public function getOtherUserStatus($conv_id, $uid) {
        $stmt = $this->db->prepare(
            'SELECT IF(TIMESTAMPDIFF(SECOND, u.last_seen, NOW()) < 45, 1, 0) AS is_online
             FROM conversations c
             JOIN users u ON u.id = IF(c.user1_id = ?, c.user2_id, c.user1_id)
             WHERE c.id = ?'
        );
        $stmt->execute([$uid, $conv_id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row ? (int)$row['is_online'] : 0;
    }

    public function toggleMeta($conv_id, $field) {
        $allowed = ['is_favorite_u1','is_favorite_u2','is_pinned_u1','is_pinned_u2','is_muted_u1','is_muted_u2'];
        if (!in_array($field, $allowed)) return false;
        $stmt = $this->db->prepare("UPDATE conversations SET $field = 1 - $field WHERE id = ?");
        $stmt->execute([$conv_id]);
        $get = $this->db->prepare("SELECT $field FROM conversations WHERE id = ?");
        $get->execute([$conv_id]);
        return (int)$get->fetchColumn();
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
