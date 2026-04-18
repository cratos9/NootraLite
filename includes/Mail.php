<?php
require '../PHPMailer-master/PHPMailer-master/src/Exception.php';
require '../PHPMailer-master/PHPMailer-master/src/PHPMailer.php';
require '../PHPMailer-master/PHPMailer-master/src/SMTP.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

class Mail {

    private $mail;

    public function __construct(){

        $this->mail = new PHPMailer(true);
        $this->mail->CharSet = 'UTF-8';

        $this->mail->isSMTP();
        $this->mail->Host = $_ENV['MAIL_HOST'];
        $this->mail->SMTPAuth = true;
        $this->mail->Username = $_ENV['MAIL_USER'];
        $this->mail->Password = $_ENV['MAIL_PASS'];
        $this->mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $this->mail->Port = $_ENV['MAIL_PORT'];
    }

    public function send($to, $subject, $body){

        try {

            $this->mail->clearAddresses();

            $this->mail->setFrom(
                $_ENV['MAIL_USER'],
                $_ENV['MAIL_FROM_NAME']
            );

            $this->mail->addAddress($to);

            $this->mail->isHTML(true);
            $this->mail->Subject = $subject;
            $this->mail->Body    = $body;
            $this->mail->AltBody = strip_tags($body);

            $this->mail->send();

            return true;

        } catch (Exception $e) {
            return "Error: {$this->mail->ErrorInfo}";
        }
    }
}