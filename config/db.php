<?php
require_once __DIR__ . '/env.php';
loadEnv(__DIR__ . '/../.env');

define('KEY', $_ENV['SECRET_KEY']);

class Database{
    private $host;
    private $user;
    private $pass;
    private $name;
    private $charset;

    public function __construct(){
        $this->host = $_ENV['DB_HOST'] ?? '';
        $this->user = $_ENV['DB_USER'] ?? '';
        $this->pass = $_ENV['DB_PASS'] ?? '';
        $this->name = $_ENV['DB_NAME'] ?? '';
        $this->charset = $_ENV['DB_CHARSET'] ?? 'utf8mb4';
    }

    public function connect(){
        try{
            $conn = "mysql:host=$this->host;dbname=$this->name;charset=$this->charset";
            $options = [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION];
            return new PDO($conn, $this->user, $this->pass, $options);
        } catch(PDOException $e){
            throw new Exception("Error al iniciar la conexion con la base de datos");
        }
    }
}
?>