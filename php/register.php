<?php
//registro de usuário

require __DIR__ . "/config.php";
header("Content-Type: application/json");

$nome     = trim($_POST["nome"] ?? "");
$email    = trim($_POST["email"] ?? "");
$telefone = trim($_POST["telefone"] ?? "");
$senha    = $_POST["senha"] ?? "";
$senha2   = $_POST["senha2"] ?? "";

if (strlen($nome) < 2) { echo json_encode(["ok"=>false,"error"=>"Nome inválido"]); exit; }
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) { echo json_encode(["ok"=>false,"error"=>"E-mail inválido"]); exit; }
if (strlen($telefone) < 8) { echo json_encode(["ok"=>false,"error"=>"Telefone inválido"]); exit; }
if (strlen($senha) < 6) { echo json_encode(["ok"=>false,"error"=>"Senha precisa ter 6+ caracteres"]); exit; }
if ($senha !== $senha2) { echo json_encode(["ok"=>false,"error"=>"Senhas diferentes"]); exit; }

$st = $pdo->prepare("SELECT id FROM usuarios WHERE email = ?");
$st->execute([$email]);
if ($st->fetch()) { echo json_encode(["ok"=>false,"error"=>"E-mail já cadastrado"]); exit; }

$hash = password_hash($senha, PASSWORD_DEFAULT);
$st = $pdo->prepare("INSERT INTO usuarios (nome,email,telefone,senha_hash) VALUES (?,?,?,?)");
$st->execute([$nome, $email, $telefone, $hash]);

$_SESSION["user_id"] = $pdo->lastInsertId();
echo json_encode(["ok" => true]);
?>
