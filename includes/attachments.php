<?php

class Attachments
{
    private $imagesDir;
    private $docsDir;

    public function __construct()
    {
        $this->imagesDir = __DIR__ . '/../files/images';
        $this->docsDir = __DIR__ . '/../files/documents';
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
            move_uploaded_file($tmp, $this->imagesDir . '/' . $name);
            $destination = $this->imagesDir . '/' . $name;
        } else {
            move_uploaded_file($tmp, $this->docsDir . '/' . $name);
            $destination = $this->docsDir . '/' . $name;
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
            $filePath = $this->imagesDir . '/' . $fileName;
        } else {
            $filePath = $this->docsDir . '/' . $fileName;
        }
        if (file_exists($filePath)) {
            unlink($filePath);
        } else {
            throw new Exception('Archivo no encontrado');
        }
    }

    public function deleteAttachmentByPath($filePath)
    {
        if (!is_string($filePath) || $filePath === '') {
            throw new Exception('Ruta de archivo inválida');
        }

        $realFilePath = realpath($filePath);
        $realImages = realpath($this->imagesDir);
        $realDocs = realpath($this->docsDir);

        $isInImages = $realFilePath && $realImages && strpos($realFilePath, $realImages) === 0;
        $isInDocs = $realFilePath && $realDocs && strpos($realFilePath, $realDocs) === 0;

        if (!$isInImages && !$isInDocs) {
            throw new Exception('Ruta de archivo no permitida');
        }

        if (file_exists($realFilePath)) {
            unlink($realFilePath);
            return;
        }

        throw new Exception('Archivo no encontrado');
    }

    private function SecurityCheck($file, $type)
    {
        if ($type === 'image/jpeg' || $type === 'image/png' || $type === 'application/pdf' || $type === 'application/msword' || $type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            $allowedTypes = ['image/jpeg', 'image/png', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
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