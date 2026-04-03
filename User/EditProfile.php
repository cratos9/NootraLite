<?php
require_once '../includes/Remember.php';
require_once '../config/encrypt.php';
require_once '../includes/lightMode.php';
require_once '../Models/UserModel.php';

$database = new Database();
try {
    $conn = $database->connect();
} catch (Exception $e) {
    die('Error en la conexión a la base de datos');
}

$user = new User($conn);

$errors = [];
$oldInput = [
    'username' => $_SESSION['user']['username'] ?? '',
    'bio' => !empty($_SESSION['user']['bio']) ? decrypt_data($_SESSION['user']['bio']) : '',
    'full_name' => !empty($_SESSION['user']['full_name']) ? decrypt_data($_SESSION['user']['full_name']) : '',
    'email' => $_SESSION['user']['email'] ?? '',
    'phone' => !empty($_SESSION['user']['phone']) ? decrypt_data($_SESSION['user']['phone']) : '',
    'country' => !empty($_SESSION['user']['country']) ? decrypt_data($_SESSION['user']['country']) : '',
    'city' => !empty($_SESSION['user']['city']) ? decrypt_data($_SESSION['user']['city']) : '',
    'institution' => !empty($_SESSION['user']['institution']) ? decrypt_data($_SESSION['user']['institution']) : '',
    'carrer' => !empty($_SESSION['user']['carrer']) ? decrypt_data($_SESSION['user']['carrer']) : '',
    'student_id' => !empty($_SESSION['user']['student_id']) ? decrypt_data($_SESSION['user']['student_id']) : '',
];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = trim($_POST['username'] ?? '');
    $bio = trim($_POST['bio'] ?? '');
    $full_name = trim($_POST['full_name'] ?? '');
    $email = strtolower(trim($_POST['email'] ?? ''));
    $phone = trim($_POST['phone'] ?? '');
    $country = trim($_POST['country'] ?? '');
    $city = trim($_POST['city'] ?? '');
    $institution = trim($_POST['institution'] ?? '');
    $carrer = trim($_POST['carrer'] ?? '');
    $student_id = trim($_POST['student_id'] ?? '');

    $oldInput = [
        'username' => $username,
        'bio' => $bio,
        'full_name' => $full_name,
        'email' => $email,
        'phone' => $phone,
        'country' => $country,
        'city' => $city,
        'institution' => $institution,
        'carrer' => $carrer,
        'student_id' => $student_id,
    ];

    if ($username === '') {
        $errors['username'] = 'El nombre de usuario es obligatorio.';
    } elseif (!preg_match('/^[a-zA-Z0-9._]{3,30}$/', $username)) {
        $errors['username'] = 'Usa entre 3 y 30 caracteres: letras, numeros, punto o guion bajo.';
    }

    if ($full_name === '') {
        $errors['full_name'] = 'El nombre completo es obligatorio.';
    } elseif (!preg_match('/^[\p{L} ]{3,80}$/u', $full_name)) {
        $errors['full_name'] = 'El nombre completo debe tener entre 3 y 80 letras.';
    }

    if ($email === '') {
        $errors['email'] = 'El correo electronico es obligatorio.';
    } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $errors['email'] = 'El formato del correo no es valido.';
    } elseif (strlen($email) > 120) {
        $errors['email'] = 'El correo no puede exceder 120 caracteres.';
    } else {
        $emailSql = 'SELECT id FROM users WHERE email = ? AND id <> ? LIMIT 1';
        $emailStmt = $conn->prepare($emailSql);
        $emailStmt->execute([$email, $_SESSION['user']['id']]);
        if ($emailStmt->fetch(PDO::FETCH_ASSOC)) {
            $errors['email'] = 'Este correo ya esta en uso por otra cuenta.';
        }
    }

    if ($bio !== '' && strlen($bio) > 300) {
        $errors['bio'] = 'La biografia no puede exceder 300 caracteres.';
    }

    if ($phone !== '' && !preg_match('/^[0-9+()\- ]{7,20}$/', $phone)) {
        $errors['phone'] = 'El telefono solo acepta numeros y + ( ) - con longitud de 7 a 20.';
    }

    if ($country !== '' && !preg_match('/^[\p{L} .\-]{2,80}$/u', $country)) {
        $errors['country'] = 'El pais debe tener entre 2 y 80 letras.';
    }

    if ($city !== '' && !preg_match('/^[\p{L} .\-]{2,80}$/u', $city)) {
        $errors['city'] = 'El estado debe tener entre 2 y 80 letras.';
    }

    if ($institution !== '' && strlen($institution) > 120) {
        $errors['institution'] = 'La escuela no puede exceder 120 caracteres.';
    }

    if ($carrer !== '' && strlen($carrer) > 120) {
        $errors['carrer'] = 'La carrera no puede exceder 120 caracteres.';
    }

    if ($student_id !== '' && !preg_match('/^[a-zA-Z0-9\-_.]{3,40}$/', $student_id)) {
        $errors['student_id'] = 'El ID de estudiante debe tener 3 a 40 caracteres alfanumericos.';
    }

    if (empty($errors)) {
        $isUpdated = $user->UpdateProfile(
            $_SESSION['user']['id'],
            $username,
            $email,
            $bio,
            $full_name,
            $phone,
            $country,
            $city,
            $institution,
            $carrer,
            $student_id
        );

        if ($isUpdated) {
            $_SESSION['user']['username'] = $username;
            $_SESSION['user']['email'] = $email;
            $_SESSION['user']['bio'] = encrypt_data($bio);
            $_SESSION['user']['full_name'] = encrypt_data($full_name);
            $_SESSION['user']['phone'] = encrypt_data($phone);
            $_SESSION['user']['country'] = encrypt_data($country);
            $_SESSION['user']['city'] = encrypt_data($city);
            $_SESSION['user']['institution'] = encrypt_data($institution);
            $_SESSION['user']['carrer'] = encrypt_data($carrer);
            $_SESSION['user']['student_id'] = encrypt_data($student_id);

            header('Location: Profile.php');
            exit();
        }

        $errors['general'] = 'No fue posible actualizar el perfil. Intenta nuevamente.';
    }
}

$activePage = 'profile';
include '../includes/sidebar.php';

include 'Views/EditProfileView.php';
?>