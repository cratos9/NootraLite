<?php

require_once '../includes/Remember.php';
require_once '../Models/UserModel.php';
require_once '../Models/FakePaymentsModel.php';
require_once '../Models/SubcriptionsModel.php';
require_once '../includes/lightMode.php';

$activePage = 'user';

$message = null;

function getSubscriptionConfig(string $plan, string $category): array
{
    $configs = [
        'individual' => [
            'free' => ['monthly_query_limit' => 100, 'max_notebooks' => 10, 'max_notes_per_notebook' => 20, 'max_attachments_per_note' => 5, 'amount' => 0],
            'pro' => ['monthly_query_limit' => 200, 'max_notebooks' => 20, 'max_notes_per_notebook' => 40, 'max_attachments_per_note' => 10, 'amount' => 150],
            'mega' => ['monthly_query_limit' => 500, 'max_notebooks' => 50, 'max_notes_per_notebook' => 100, 'max_attachments_per_note' => 20, 'amount' => 200],
        ],
        'education' => [
            'free' => ['monthly_query_limit' => 500, 'max_notebooks' => 50, 'max_notes_per_notebook' => 100, 'max_attachments_per_note' => 20, 'amount' => 100],
            'pro' => ['monthly_query_limit' => 1000, 'max_notebooks' => 100, 'max_notes_per_notebook' => 200, 'max_attachments_per_note' => 50, 'amount' => 130],
            'mega' => ['monthly_query_limit' => 2000, 'max_notebooks' => 200, 'max_notes_per_notebook' => 500, 'max_attachments_per_note' => 100, 'amount' => 180],
        ],
        'enterprise' => [
            'free' => ['monthly_query_limit' => 1000, 'max_notebooks' => 100, 'max_notes_per_notebook' => 200, 'max_attachments_per_note' => 50, 'amount' => 1500],
            'pro' => ['monthly_query_limit' => 2000, 'max_notebooks' => 200, 'max_notes_per_notebook' => 400, 'max_attachments_per_note' => 100, 'amount' => 2000],
            'mega' => ['monthly_query_limit' => 5000, 'max_notebooks' => 500, 'max_notes_per_notebook' => 1000, 'max_attachments_per_note' => 200, 'amount' => 2500],
        ],
    ];

    return $configs[$category][$plan] ?? [];
}

function setFirstError(?string &$message, string $candidate): void
{
    if ($message === null) {
        $message = $candidate;
    }
}

function scheduleIndividualCancellation(SubscriptionsModel $subscriptions, array $currentSubscription, string $now): bool
{
    $currentNextPayment = $currentSubscription['next_payment_date'] ?? null;
    $currentNextPaymentTs = $currentNextPayment ? strtotime($currentNextPayment) : false;
    $effectiveEndDate = ($currentNextPaymentTs && $currentNextPaymentTs > time())
        ? $currentNextPayment
        : date('Y-m-d H:i:s', strtotime('+1 month'));

    return $subscriptions->updateSubscription(
        (int)$currentSubscription['id'],
        (string)$currentSubscription['plan_type'],
        (string)$currentSubscription['subscription_category'],
        'canceled',
        (int)$currentSubscription['monthly_query_limit'],
        (int)$currentSubscription['queries_used'],
        (int)$currentSubscription['max_notebooks'],
        (int)$currentSubscription['max_notes_per_notebook'],
        (int)$currentSubscription['max_attachments_per_note'],
        $effectiveEndDate,
        null,
        (string)($currentSubscription['last_payment_date'] ?? $now),
        $effectiveEndDate
    );
}

$database = new Database();
try {
    $conn = $database->connect();
} catch (Exception $e) {
    die('Error en la conexión a la base de datos');
}

$user = new User($conn);
$fakePayments = new FakePayments($conn);
$subscriptions = new SubscriptionsModel($conn);

$plan = $_GET['plan'] ?? null;
$category = $_GET['category'] ?? null;

if ($_SERVER['REQUEST_METHOD'] !== 'POST' && $plan === 'free' && $category === 'individual') {
    $currentSubscription = $subscriptions->getSubcription($_SESSION['user']['id']);
    if (!$currentSubscription) {
        header('Location: Subscriptions.php?success=errorPayment');
        exit();
    }

    $scheduled = scheduleIndividualCancellation($subscriptions, $currentSubscription, date('Y-m-d H:i:s'));
    header('Location: Subscriptions.php?success=' . ($scheduled ? 'cancellationScheduled' : 'errorPayment'));
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST' && (!$plan || !$category)){
    $message = "Plan o categoría no especificados.";
}

if ($_SERVER['REQUEST_METHOD'] === 'POST'){
    $message = null;
    $plan = $_POST['plan'] ?? null;
    $category = $_POST['category'] ?? null;
    $user_id = $_SESSION['user']['id'];
    $cardholderName = trim((string)($_POST['cardholderName'] ?? ''));
    $cardNumber = preg_replace('/\D+/', '', (string)($_POST['cardNumber'] ?? ''));
    $expiryDate = trim((string)($_POST['expiryDate'] ?? ''));
    $cvv = preg_replace('/\D+/', '', (string)($_POST['cvv'] ?? ''));
    $address = trim((string)($_POST['address'] ?? ''));
    $cardType = trim((string)($_POST['cardType'] ?? ''));

    $currentSubscription = $subscriptions->getSubcription($user_id);
    if (!$currentSubscription) {
        setFirstError($message, 'No se encontró una suscripción para el usuario.');
    }

    if (!in_array($plan, ['free', 'pro', 'mega'])) {
        setFirstError($message, "Plan inválido. Debe ser 'free', 'pro' o 'mega'.");
    }

    if (!in_array($category, ['individual', 'education', 'enterprise'])) {
        setFirstError($message, "Categoría inválida. Debe ser 'individual', 'education' o 'enterprise'.");
    }

    if (strlen($cardholderName) < 5 || strlen($cardholderName) > 255) {
        setFirstError($message, 'Nombre del titular inválido. Debe tener entre 5 y 255 caracteres.');
    }

    if (!in_array($cardType, ['credit', 'debit'])) {
        setFirstError($message, "Tipo de tarjeta inválido. Debe ser 'credit' o 'debit'.");
    }

    if (strlen($cardNumber) < 13 || strlen($cardNumber) > 19) {
        setFirstError($message, 'Número de tarjeta inválido. Debe tener entre 13 y 19 dígitos.');
    }

    if (!preg_match('/^(0[1-9]|1[0-2])\/\d{2}$/', $expiryDate)) {
        setFirstError($message, 'Fecha de vencimiento inválida. El formato debe ser MM/YY.');
    }

    if (strlen($cvv) != 3) {
        setFirstError($message, 'CVV inválido. Debe tener exactamente 3 dígitos.');
    }

    if (strlen($address) < 10 || strlen($address) > 255) {
        setFirstError($message, 'Dirección inválida. Debe tener entre 10 y 255 caracteres.');
    }

    $subscriptionConfig = getSubscriptionConfig((string)$plan, (string)$category);
    if (empty($subscriptionConfig)) {
        setFirstError($message, 'No se pudo obtener la configuración del plan seleccionado.');
    }

    $last4 = str_pad(substr($cardNumber, -4), 4, '0', STR_PAD_LEFT);

    if ($message !== null) {
        include 'Views/PayFakeView.php';
        echo '
        <script>
        message.error("' . $message . '");
        </script>';
        exit();
    }

    $now = date('Y-m-d H:i:s');

    if ($category === 'individual' && $plan === 'free') {
        $cancellationScheduled = scheduleIndividualCancellation($subscriptions, $currentSubscription, $now);

        if ($cancellationScheduled) {
            header('Location: Subscriptions.php?success=cancellationScheduled');
            exit();
        }

        $message = 'No se pudo programar la cancelación de la suscripción.';
        include 'Views/PayFakeView.php';
        echo '
        <script>
        message.error("' . $message . '");
        </script>';
        exit();
    }

    $amount = (int)$subscriptionConfig['amount'];
    $currency = 'MXN';

    $ramdomPosibility = rand(1, 10);
    if ($ramdomPosibility == 9){
        header('Location: Subscriptions.php?success=errorPayment');
        exit();
    }

    if ($fakePayments->CreateFakePayment($user_id, $cardholderName, $last4, $cardType, $amount, $currency)){
        $nextPaymentDate = date('Y-m-d H:i:s', strtotime('+1 month'));
        $updated = $subscriptions->updateSubscription(
            (int)$currentSubscription['id'],
            $plan,
            $category,
            'active',
            (int)$subscriptionConfig['monthly_query_limit'],
            0,
            (int)$subscriptionConfig['max_notebooks'],
            (int)$subscriptionConfig['max_notes_per_notebook'],
            (int)$subscriptionConfig['max_attachments_per_note'],
            null,
            $nextPaymentDate,
            $now,
            $nextPaymentDate
        );

        if (!$updated) {
            $message = 'El pago fue simulado, pero no se pudo actualizar la suscripción.';
            include 'Views/PayFakeView.php';
            echo '
            <script>
            message.error("' . $message . '");
            </script>';
            exit();
        }

        header('Location: Subscriptions.php?success=successPayment');
        exit();
    } else {
        $message = 'Error al procesar el pago falso. Inténtalo de nuevo.';
    }
}
include 'Views/PayFakeView.php';
if (isset($message)) {
    echo '
    <script>
    message.error("' . $message . '");
    </script>';
}
?>