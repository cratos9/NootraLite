<?php

require_once __DIR__ . '/env.php';
loadEnv(__DIR__ . '/../.env');

function encrypt_data($data) {
    $iv = random_bytes(16);

    $encrypted = openssl_encrypt(
        $data,
        "AES-256-CBC",
        $_ENV['SECRET_KEY'],
        0,
        $iv
    );

    return base64_encode($iv . $encrypted);
}

function decrypt_data($data) {
    $data = base64_decode($data);

    $iv = substr($data, 0, 16);
    $encrypted = substr($data, 16);

    return openssl_decrypt(
        $encrypted,
        "AES-256-CBC",
        $_ENV['SECRET_KEY'],
        0,
        $iv
    );
}
?>