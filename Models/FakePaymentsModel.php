<?php

require_once '../config/encrypt.php';
require_once '../config/db.php';

class FakePayments{
    private $conn;

    public function __construct($db){
        $this->conn = $db;
    }

    public function CreateFakePayment($user_id, $card_holder_name, $card_last4, $card_type, $amount, $currency){
        $sql = "INSERT INTO fake_payments (user_id, card_holder_name, card_last4, card_type, amount, currency) VALUES (?, ?, ?, ?, ?, ?)";
        $stmt = $this->conn->prepare($sql);
        return $stmt->execute([$user_id, $card_holder_name, $card_last4, $card_type, $amount, $currency]);
    }

    public function GetFakePaymentsByUserId($user_id){
        $sql = "SELECT * FROM fake_payments WHERE user_id = ? ORDER BY created_at DESC";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([$user_id]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function GetFakePaymentById($user_id, $payment_id){
        $sql = "SELECT * FROM fake_payments WHERE id = ? AND user_id = ?";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([$payment_id, $user_id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

}

?>