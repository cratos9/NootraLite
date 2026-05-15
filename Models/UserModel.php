<?php

require_once '../config/encrypt.php';
require_once '../config/db.php';

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
        $fullname = encrypt_data($fullname);

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

    public function UpdateProfile($userId, $username, $email, $bio, $full_name, $phone, $country, $city, $institution, $carrer, $student_id){
        $oldEmail = $_SESSION['user']['email'] ?? null;
        if ($email !== $oldEmail) {
            $sql = "UPDATE users SET is_verified = 0 WHERE id = ?";
            $stmt = $this->conn->prepare($sql);
            $stmt->execute([$userId]);
            $_SESSION['user']['is_verified'] = 0;
        }
        $full_name = encrypt_data($full_name);
        $country = encrypt_data($country);
        $city = encrypt_data($city);
        $institution = encrypt_data($institution);
        $carrer = encrypt_data($carrer);
        $bio = encrypt_data($bio);
        $student_id = encrypt_data($student_id);
        $sql = "UPDATE users SET full_name = ?, phone = ?, country = ?, city = ?, institution = ?, career = ?, student_id = ?, bio = ?, username = ?, email = ? WHERE id = ?";
        $stmt = $this->conn->prepare($sql);
        return $stmt->execute([$full_name, $phone, $country, $city, $institution, $carrer, $student_id, $bio, $username, $email, $userId]);
    }

    public function Logout(){
        session_start();
        $uid = $_SESSION['user']['id'] ?? null;
        if ($uid) {
            $stmt = $this->conn->prepare('UPDATE users SET last_seen = DATE_SUB(NOW(), INTERVAL 46 SECOND) WHERE id = ?');
            $stmt->execute([$uid]);
        }
        session_destroy();
        setcookie('remember_me', '', time() - 3600, "/");
        header('Location: Login.php');
        exit;
    }

    public function UpdateProfilePhoto($userId, $photoPath){
        $sql = "UPDATE users SET avatar_url = ? WHERE id = ?";
        $stmt = $this->conn->prepare($sql);
        return $stmt->execute([$photoPath, $userId]);
    }

    public function DeleteAccount($userId, $password){
        $sql = "SELECT password_hash FROM users WHERE id = ?";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([$userId]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($user && password_verify($password, $user['password_hash'])) {
            $sql = "DELETE FROM users WHERE id = ?";
            $stmt = $this->conn->prepare($sql);
            return $stmt->execute([$userId]);
        } else {
            return false;
        }
    }

    public function UpdatePassword($userId, $currentPassword, $newPassword){
        $sql = "SELECT password_hash FROM users WHERE id = ?";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([$userId]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($user && password_verify($currentPassword, $user['password_hash'])) {
            $new_password_hash = password_hash($newPassword, PASSWORD_DEFAULT);
            $sql = "UPDATE users SET password_hash = ? WHERE id = ?";
            $stmt = $this->conn->prepare($sql);
            return $stmt->execute([$new_password_hash, $userId]);
        } else {
            return false;
        }
    }

    public function GetTokenForgotPassword($email){
        $sql = "SELECT id, reset_token FROM users WHERE email = ? AND reset_token IS NOT NULL AND reset_token_expiry IS NOT NULL AND reset_token_expiry > NOW()";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([$email]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($user) {
            return ['token' => $user['reset_token'], 'user_id' => $user['id']];
        }

        $sql = "SELECT id FROM users WHERE email = ?";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([$email]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($user) {
            $token = bin2hex(random_bytes(3));
            $sql = "UPDATE users SET reset_token = ?, reset_token_expiry = DATE_ADD(NOW(), INTERVAL 1 HOUR) WHERE id = ?";
            $stmt = $this->conn->prepare($sql);
            if ($stmt->execute([$token, $user['id']])) {
                return ['token' => $token, 'user_id' => $user['id']];
            }
        }
        return false;
    }

    public function ResetPassword($userId, $token, $newPassword){
        $sql = "SELECT id FROM users WHERE id = ? AND reset_token = ? AND reset_token_expiry IS NOT NULL AND reset_token_expiry > NOW()";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([$userId, $token]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($user) {
            $new_password_hash = password_hash($newPassword, PASSWORD_DEFAULT);
            $sql = "UPDATE users SET password_hash = ?, reset_token = NULL, reset_token_expiry = NULL WHERE id = ?";
            $stmt = $this->conn->prepare($sql);
            return $stmt->execute([$new_password_hash, $userId]);
        } else {
            return false;
        }
    }

    public function IsVerified($userId){
        $sql = "SELECT is_verified FROM users WHERE id = ?";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([$userId]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        return $user == 1 ? true : false;
    }

    public function VerifyEmail($email){
        $sql = "UPDATE users SET is_verified = 1, email_verified_at = NOW() WHERE email = ?";
        $stmt = $this->conn->prepare($sql);
        return $stmt->execute([$email]);
    }

    public function SetVerificationToken($email, $token){
        $sql = "UPDATE users SET verification_token = ?, verification_token_expiry = DATE_ADD(NOW(), INTERVAL 24 HOUR) WHERE email = ?";
        $stmt = $this->conn->prepare($sql);
        return $stmt->execute([$token, $email]);
    }

    public function GetVerificationToken($email, $token){
        $sql = "SELECT id FROM users WHERE email = ? AND verification_token = ? AND verification_token_expiry IS NOT NULL AND verification_token_expiry > NOW()";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([$email, $token]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function getUserId($email){
        $sql = "SELECT id FROM users WHERE email = ?";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([$email]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        return $user['id'];
    }

    public function IsTwoFactorEnabled($userId){
        $sql = "SELECT is_two_factor FROM users WHERE id = ?";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([$userId]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        return $user['is_two_factor'] == 1 ? true : false;
    }

    public function EnableTwoFactor($userId){
        $sql = "UPDATE users SET is_two_factor = 1 WHERE id = ?";
        $stmt = $this->conn->prepare($sql);
        return $stmt->execute([$userId]);
    }

    public function DisableTwoFactor($userId){
        $sql = "UPDATE users SET is_two_factor = 0 WHERE id = ?";
        $stmt = $this->conn->prepare($sql);
        return $stmt->execute([$userId]);
    }

}

?>