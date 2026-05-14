<?php
require_once '../includes/Remember.php';
require_once '../includes/lightMode.php';
require_once '../Models/SubcriptionsModel.php';

$activePage = 'profile';

$database = new Database();
try {
    $conn = $database->connect();
} catch (Exception $e) {
    die('Error en la conexión a la base de datos');
}

$subscriptionsModel = new SubscriptionsModel($conn);
$action = $_GET['action'] ?? null;

if ($action === 'cancelIndividualSubscription') {
    $subscription = $subscriptionsModel->getSubcription($_SESSION['user']['id']);

    if (!$subscription) {
        header('Location: Subscriptions.php?success=errorPayment');
        exit();
    }

    if ($subscription['plan_type'] === 'free' && $subscription['subscription_category'] === 'individual') {
        header('Location: Subscriptions.php');
        exit();
    }

    $now = date('Y-m-d H:i:s');
    $currentNextPayment = $subscription['next_payment_date'] ?? null;
    $currentNextPaymentTs = $currentNextPayment ? strtotime($currentNextPayment) : false;
    $effectiveEndDate = ($currentNextPaymentTs && $currentNextPaymentTs > time())
        ? $currentNextPayment
        : date('Y-m-d H:i:s', strtotime('+1 month'));

    $cancellationScheduled = $subscriptionsModel->updateSubscription(
        (int)$subscription['id'],
        (string)$subscription['plan_type'],
        (string)$subscription['subscription_category'],
        'canceled',
        (int)$subscription['monthly_query_limit'],
        (int)$subscription['queries_used'],
        (int)$subscription['max_notebooks'],
        (int)$subscription['max_notes_per_notebook'],
        (int)$subscription['max_attachments_per_note'],
        $effectiveEndDate,
        null,
        (string)($subscription['last_payment_date'] ?? $now),
        $effectiveEndDate
    );

    header('Location: Subscriptions.php?success=' . ($cancellationScheduled ? 'cancellationScheduled' : 'errorPayment'));
    exit();
}

$success = $_GET['success'] ?? null;
if ($success == 'successPayment'){
    $message = "Pago realizado con exito, tu suscripción ha sido actualizada.";
} elseif ($success == 'canceledPayment'){
    $message = "Pago cancelado, tu suscripción no ha sido actualizada.";
} elseif ($success == 'cancellationScheduled'){
    $message = "Tu suscripción fue cancelada y se cambiará automáticamente a plan gratis individual al finalizar tu periodo vigente.";
} elseif ($success == 'errorPayment'){
    $message = "Ocurrió un error durante el proceso de pago, por favor intenta de nuevo.";
}

$subscription = $subscriptionsModel->getSubcription($_SESSION['user']['id']);

include 'Views/SubscriptionsView.php';
if (isset($message)) {
    echo '
    <script>
    message.success("' . $message . '");
    </script>';
}
?>