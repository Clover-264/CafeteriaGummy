<?php
//conexão com o banco de dados MySQL

$DB_HOST = "sql208.infinityfree.com"; 
$DB_NAME = "if0_42175531_db_bubbletea"; 
$DB_USER = "if0_42175531";         
$DB_PASS = "nfgbnMbUiw15h";  

$SITE_URL = "https://delicias-gostosuras.infinityfreeapp.com";
$PIX_KEY = "22993525674";
$STORE_EMAIL = "nao-responda@dlcsegost.infinityfreeapp.com";

$RESET_DEBUG_MODE = true;

try {
  $pdo = new PDO(
    "mysql:host=$DB_HOST;dbname=$DB_NAME;charset=utf8mb4",
    $DB_USER,
    $DB_PASS,
    [
      PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
      PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]
  );
} catch (PDOException $e) {
  http_response_code(500);
  header("Content-Type: application/json");
  echo json_encode(["ok" => false, "error" => "Erro ao conectar no banco. Confira config.php."]);
  exit;
}

if (session_status() === PHP_SESSION_NONE) {
  session_start();
}
?>
