<?php
$host = '127.0.0.1';
$db   = 'nootra';
$user = 'root';
$pass = 'nootra123';

$pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8mb4", $user, $pass);
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
