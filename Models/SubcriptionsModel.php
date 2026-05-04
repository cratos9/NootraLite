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
}

?>