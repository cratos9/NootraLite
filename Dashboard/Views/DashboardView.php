<!DOCTYPE html>
<html lang="es-MX">
<head>
  <script>document.documentElement.style.visibility='hidden';document.documentElement.style.background=localStorage.getItem('theme')==='light'?'#f0f2f8':'#0f0f1a'</script>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dashboard · NootraLite</title>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.min.js"></script>
  <link rel="stylesheet" href="../css/includes/sidebar.css">
  <link rel="stylesheet" href="../css/includes/toast.css">
  <link rel="stylesheet" href="../css/dashboard/dashboard.css">
</head>
<body>
<?php include '../includes/sidebar.php'; ?>
<div class="dash-wrap">
  <!-- contenido — sesiones D2+ -->
</div>

<script>
var dashUid  = <?= (int)($_SESSION['user']['id'] ?? 0) ?>;
var dashName = <?= json_encode($_SESSION['user']['username'] ?? 'Usuario') ?>;
</script>
<script src="../js/includes/sidebar.js"></script>
<script src="../js/includes/toast.js"></script>
<script>lucide.createIcons(); document.documentElement.style.visibility='';</script>
</body>
</html>
