<?php

require_once '../Models/UserModel.php';
require_once '../config/db.php';

$database = new Database();

try {
    $conn = $database->connect();
} catch (Exception $e) {
    die('Error en la conexión a la base de datos');
}

$usuario = new User($conn);

$mensaje = "";
$errors = [];
$oldInput = [
    'fullname' => '',
    'username' => '',
    'email' => '',
];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $fullname = trim($_POST['fullname'] ?? '');
    $username = trim($_POST['username'] ?? '');
    $email = strtolower(trim($_POST['email'] ?? ''));
    $password = (string) ($_POST['password'] ?? '');
    $password_confirm = (string) ($_POST['confirm_password'] ?? '');

    $oldInput = [
        'fullname' => $fullname,
        'username' => $username,
        'email' => $email,
    ];

    if ($fullname === '') {
        $errors['fullname'] = 'El nombre completo es obligatorio.';
    } elseif (!preg_match('/^[\p{L} ]{3,80}$/u', $fullname)) {
        $errors['fullname'] = 'El nombre completo debe tener entre 3 y 80 letras.';
    }

    if ($username === '') {
        $errors['username'] = 'El nombre de usuario es obligatorio.';
    } elseif (!preg_match('/^[a-zA-Z0-9._]{3,30}$/', $username)) {
        $errors['username'] = 'Usa entre 3 y 30 caracteres: letras, numeros, punto o guion bajo.';
    } else {
        $usernameSql = 'SELECT id FROM users WHERE username = ? LIMIT 1';
        $usernameStmt = $conn->prepare($usernameSql);
        $usernameStmt->execute([$username]);
        if ($usernameStmt->fetch(PDO::FETCH_ASSOC)) {
            $errors['username'] = 'Ese nombre de usuario ya esta en uso.';
        }
    }

    if ($email === '') {
        $errors['email'] = 'El correo es obligatorio.';
    } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $errors['email'] = 'El formato del correo no es valido.';
    } elseif (strlen($email) > 120) {
        $errors['email'] = 'El correo no puede exceder 120 caracteres.';
    }

    if ($password === '') {
        $errors['password'] = 'La contraseña es obligatoria.';
    } elseif (strlen($password) < 8) {
        $errors['password'] = 'La contraseña debe tener al menos 8 caracteres.';
    } elseif (!preg_match('/[A-Z]/', $password) || !preg_match('/[a-z]/', $password) || !preg_match('/\d/', $password)) {
        $errors['password'] = 'La contraseña debe incluir mayuscula, minuscula y numero.';
    }

    if ($password_confirm === '') {
        $errors['confirm_password'] = 'Confirma tu contraseña.';
    } elseif ($password !== $password_confirm) {
        $errors['confirm_password'] = 'Las contraseñas no coinciden.';
    }

    if (empty($errors) && $usuario->Register($fullname, $email, $password, $username)) {
        header('Location: Login.php');
        exit();
    } elseif (empty($errors)) {
        $mensaje = "Error al registrar";
    }
} 
include 'Views/RegisterView.php';
?>