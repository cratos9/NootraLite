<?php
require_once __DIR__ . '/env.php';
loadEnv(__DIR__ . '/../.env');

define('KEY', $_ENV['SECRET_KEY']);

$conn = new mysqli(
    $_ENV['DB_HOST'],
    $_ENV['DB_USER'],
    $_ENV['DB_PASS'],
    $_ENV['DB_NAME']
);

if ($conn->connect_error) {
    die("Error de conexión: " . $conn->connect_error);
} else {
    echo "Conexión exitosa";
}
?>