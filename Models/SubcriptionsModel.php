<?php

require_once '../config/db.php';

class SubscriptionsModel{
    private $conn;

    public function __construct($db){
        $this->conn = $db;
    }

    public function getSubcription($user_id){
        $query = "SELECT * FROM subscriptions WHERE user_id = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->execute([$user_id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function countBooksByUser($user_id){
        $query = "SELECT COUNT(*) AS total FROM notebooks WHERE user_id = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->execute([$user_id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return (int) ($row['total'] ?? 0);
    }

    public function countNotesByNotebook($user_id, $notebook_id){
        $query = "SELECT COUNT(*) AS total FROM notes WHERE user_id = ? AND notebook_id = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->execute([$user_id, $notebook_id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return (int) ($row['total'] ?? 0);
    }

    public function countAttachmentsByNotebook($user_id, $notebook_id){
        $query = "SELECT COUNT(*) AS total FROM attachments WHERE user_id = ? AND notebook_id = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->execute([$user_id, $notebook_id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return (int) ($row['total'] ?? 0);
    }

    public function canUseQuery($user_id){
        $subscription = $this->getSubcription($user_id);
        if (!$subscription) {
            return false;
        }

        return (int)($subscription['queries_used'] ?? 0) < (int)($subscription['monthly_query_limit'] ?? 0);
    }

    public function addSubscription($user_id){
        $query = "INSERT INTO subscriptions (user_id, plan_type, subscription_category, status, monthly_query_limit, queries_used, max_notebooks, max_notes_per_notebook, max_attachments_per_note, end_date, renewal_date, last_payment_date, next_payment_date) VALUES (?, 'free', 'individual', 'active', 100, 0, 10, 20, 5, null, null, null, null)";
        $stmt = $this->conn->prepare($query);
        return $stmt->execute([$user_id]);
    }

    public function updateSubscription($subscription_id, $plan_type, $subscription_category, $status, $monthly_query_limit, $queries_used, $max_notebooks, $max_notes_per_notebook, $max_attachments_per_note, $end_date, $renewal_date, $last_payment_date, $next_payment_date){
        $query = "UPDATE subscriptions SET plan_type = ?, subscription_category = ?, status = ?, monthly_query_limit = ?, queries_used = ?, max_notebooks = ?, max_notes_per_notebook = ?, max_attachments_per_note = ?, end_date = ?, renewal_date = ?, last_payment_date = ?, next_payment_date = ? WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        return $stmt->execute([$plan_type, $subscription_category, $status, $monthly_query_limit, $queries_used, $max_notebooks, $max_notes_per_notebook, $max_attachments_per_note, $end_date, $renewal_date, $last_payment_date, $next_payment_date, $subscription_id]);
    }

    public function pauseSubscription($subscription_id){
        $query = "UPDATE subscriptions SET status = 'paused' WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        return $stmt->execute([$subscription_id]);
    }

    public function cancelSubscription($subscription_id){
        $query = "UPDATE subscriptions SET status = 'canceled' WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        return $stmt->execute([$subscription_id]);
    }

    public function useQuerie($user_id){
        $query = "UPDATE subscriptions SET queries_used = queries_used + 1 WHERE user_id = ?";
        $stmt = $this->conn->prepare($query);
        return $stmt->execute([$user_id]);
    }

    public function resetMonthlyQueries(){
        $query = "UPDATE subscriptions SET queries_used = 0 WHERE status = 'active'";
        $stmt = $this->conn->prepare($query);
        return $stmt->execute();
    }

    public function changeBasicPlan($subscription_id){
        $query = "UPDATE subscriptions SET plan_type = 'free', subscription_category = 'individual', monthly_query_limit = 100, max_notebooks = 10, max_notes_per_notebook = 20, max_attachments_per_note = 5 WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        return $stmt->execute([$subscription_id]);
    }
}

?>