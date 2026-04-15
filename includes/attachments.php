<?php

class Attachments
{
    public function __construct()
    {
        $this ->db = new Database();
        try {
            $conn = $this->db->connect();
        } catch (Exception $e) {
            die('Error en la conexión a la base de datos');
        }
        $this->conn = $conn;
        $images = __DIR__ . '/../files/images';
        $docs = __DIR__ . '/../files/docs';
    }

    public function uploadAttachment($file)
    {
        if (!isset($file) || $file['error'] !== UPLOAD_ERR_OK) {
            throw new Exception('Error al subir el archivo');
        }
        $tmp = $file['tmp_name'];
        $type = $file['type'];
        $name = uniqid() . '_' . basename($file['name']);
        $this->SecurityCheck($file, $type);
        if ($type === 'image/jpeg' || $type === 'image/png') {
            move_uploaded_file($tmp, __DIR__ . '/../files/images/' . $name);
            $destination = __DIR__ . '/../files/images/' . $name;
        } else {
            move_uploaded_file($tmp, __DIR__ . '/../files/docs/' . $name);
            $destination = __DIR__ . '/../files/docs/' . $name;
        }
        return [$destination, $name];
    }

    public function getAttachmentInfo($postId)
    {
        $content = fopen('php://temp', 'r+');
        while ($row = $this->fetchAttachment($postId)) {
            fwrite($content, $row['attachment_data']);
        }
        fclose($content);
        return $content;
    }

    public function deleteAttachment($fileName, $type)
    {
        if ($type === 'image/jpeg' || $type === 'image/png') {
            $filePath = __DIR__ . '/../files/images/' . $fileName;
        } else {
            $filePath = __DIR__ . '/../files/docs/' . $fileName;
        }
        if (file_exists($filePath)) {
            unlink($filePath);
        } else {
            throw new Exception('Archivo no encontrado');
        }
    }

    private function SecurityCheck($file, $type)
    {
        if ($type === 'image/jpeg' || $type === 'image/png') {
            $allowedTypes = ['image/jpeg', 'image/png'];
            if (!in_array($file['type'], $allowedTypes)) {
                throw new Exception('Tipo de archivo no permitido');
            }
        }
        if ($file['size'] > 5 * 1024 * 1024) {
            throw new Exception('Archivo demasiado grande');
        }
    }
}

?>