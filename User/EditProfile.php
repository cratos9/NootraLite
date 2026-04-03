<?php
require_once '../includes/Remember.php';
require_once '../config/encrypt.php';
require_once '../includes/lightMode.php';

$activePage = 'profile';
include '../includes/sidebar.php';

include 'Views/EditProfileView.php';
?>