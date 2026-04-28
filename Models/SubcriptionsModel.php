<?php

require_once '../config/encrypt.php';
require_once '../config/db.php';

class User{
    private $conn;

    public function __construct($db){
        $this->conn = $db;
    }

    

}

?>