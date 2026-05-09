<?php
require_once '../config/db.php';
require_once __DIR__ . '/../Models/FakePaymentsModel.php';

function reviewSubscriptionDates(PDO $conn, int $userId): void
{
    $sql = 'SELECT id, plan_type, subscription_category, status, end_date, next_payment_date FROM subscriptions WHERE user_id = ? LIMIT 1';
    $stmt = $conn->prepare($sql);
    $stmt->execute([$userId]);
    $subscription = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$subscription) {
        return;
    }

    $now = time();
    $status = (string)($subscription['status'] ?? 'active');
    $endDate = $subscription['end_date'] ?? null;
    $endTs = $endDate ? strtotime($endDate) : false;

    if ($status === 'canceled' && ($endTs === false || $endTs <= $now)) {
        $downgradeSql = "UPDATE subscriptions
                         SET plan_type = 'free',
                             subscription_category = 'individual',
                             status = 'active',
                             monthly_query_limit = 100,
                             queries_used = 0,
                             max_notebooks = 10,
                             max_notes_per_notebook = 20,
                             max_attachments_per_note = 5,
                             end_date = NULL,
                             renewal_date = NULL,
                             last_payment_date = NULL,
                             next_payment_date = NULL
                         WHERE id = ?";
        $downgradeStmt = $conn->prepare($downgradeSql);
        $downgradeStmt->execute([(int)$subscription['id']]);
        return;
    }

    $nextPaymentDate = $subscription['next_payment_date'] ?? null;
    $nextPaymentTs = $nextPaymentDate ? strtotime($nextPaymentDate) : false;
    if ($status === 'active' && $nextPaymentTs !== false && $nextPaymentTs <= $now) {
        $newNextPayment = date('Y-m-d H:i:s', strtotime('+1 month', $nextPaymentTs));
        $nowDt = date('Y-m-d H:i:s');
        $renewalStmt = $conn->prepare('UPDATE subscriptions SET renewal_date = ?, next_payment_date = ?, queries_used = 0, last_payment_date = ? WHERE id = ?');
        $renewalStmt->execute([$newNextPayment, $newNextPayment, $nowDt, (int)$subscription['id']]);

        try {
            $fakePayments = new FakePayments($conn);
            $lastPayments = $fakePayments->GetFakePaymentsByUserId($userId);
            if (!empty($lastPayments) && isset($lastPayments[0]['card_holder_name'])) {
                $last = $lastPayments[0];
                $card_holder_name = $last['card_holder_name'] ?? '';
                $card_last4 = $last['card_last4'] ?? '';
                $card_type = $last['card_type'] ?? '';
                $amount = $last['amount'] ?? 0;
                $currency = $last['currency'] ?? 'MXN';
                $fakePayments->CreateFakePayment($userId, $card_holder_name, $card_last4, $card_type, $amount, $currency);
            }
        } catch (Exception $e) {
            error_log('No se pudo replicar pago fake: ' . $e->getMessage());
        }
    }
}

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

$database = new Database();

try {
    $conn = $database->connect();
} catch (Exception $e) {
    error_log('Error en la conexión a la base de datos: ' . $e->getMessage());
    return;
}

if (!isset($_SESSION['user']) && isset($_COOKIE['remember_me'])) {
    $token = trim((string) $_COOKIE['remember_me']);

    if ($token === '') {
        setcookie('remember_me', '', time() - 3600, '/');
        return;
    }

    $sql = 'SELECT * FROM users WHERE remember_token = ? AND remember_expires > NOW()';
    $stmt = $conn->prepare($sql);
    $stmt->execute([$token]);
    $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($usuario) {
        session_regenerate_id(true);
        $_SESSION['user'] = $usuario;
        reviewSubscriptionDates($conn, (int)$usuario['id']);
    } else {
        setcookie('remember_me', '', time() - 3600, '/');
    }
} elseif (!isset($_SESSION['user']) && !isset($_COOKIE['remember_me'])) {
    $currentPage = basename($_SERVER['PHP_SELF'] ?? '');
    if ($currentPage !== 'Login.php' && $currentPage !== 'Register.php') {
        header('Location: ../User/Login.php');
        exit();
    }
} elseif (isset($_SESSION['user']['id'])) {
    reviewSubscriptionDates($conn, (int)$_SESSION['user']['id']);
}