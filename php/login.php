<?php
//Valida email e senha e inicia sessão do usuário

require __DIR__ . "/config.php";
header("Content-Type: application/json");

$email = trim($_POST["email"] ?? "");
$senha = $_POST["senha"] ?? "";

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
  echo json_encode(["ok"=>false,"error"=>"Digite um e-mail válido"]); exit;
}

$st = $pdo->prepare("SELECT id, senha_hash FROM usuarios WHERE email = ?");
$st->execute([$email]);
$u = $st->fetch();

if (!$u || !password_verify($senha, $u["senha_hash"])) {
  echo json_encode(["ok"=>false,"error"=>"E-mail ou senha incorretos"]);
  exit;
}

$_SESSION["user_id"] = $u["id"];
echo json_encode(["ok" => true]);
?>
