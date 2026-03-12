<?php

class User{
    private $conn;

    public function __construct($db){
        $this->conn = $db;
    }

    public function Register($fullname, $email, $password, $username){
        
        $sql = "SELECT * FROM users WHERE email = ?";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([$email]);

        if ($stmt->fetch()) {
            return false;
        }

        $password_hash = password_hash($password, PASSWORD_DEFAULT);

        $sql = "INSERT INTO users (full_name, email, password_hash, username) VALUES (?, ?, ?, ?)";

        $stmt = $this->conn->prepare($sql);

        return $stmt->execute([$fullname, $email, $password_hash, $username]);
    }

    public function Login($email, $password){

        $sql = "SELECT * FROM users WHERE email = ?";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([$email]);

        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($user && password_verify($password, $user['password_hash'])) {
            $sql = "UPDATE users SET last_login = NOW() WHERE id = ?";
            $stmt = $this->conn->prepare($sql);
            $stmt->execute([$user['id']]);
            if (session_status() === PHP_SESSION_NONE) {
                session_start();
            }
            $_SESSION['user'] = $user;
            return $user;
        } else {
            return false;
        }
    }

    public function Logout(){
        session_start();
        session_destroy();
        setcookie('remember_me', '', time() - 3600, "/");
        header('Location: Login.php');
        exit;
    }
}
?>