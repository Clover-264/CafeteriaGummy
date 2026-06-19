<?php
//Obtem informações de quem está logado

require __DIR__ . "/config.php";
header("Content-Type: application/json");

if (empty($_SESSION["user_id"])) { echo json_encode(["logged"=>false]); exit; }

$uid = $_SESSION["user_id"];
$st = $pdo->prepare("SELECT id, nome, email, telefone FROM usuarios WHERE id=?");
$st->execute([$uid]);
$user = $st->fetch();
if (!$user) { echo json_encode(["logged"=>false]); exit; }

$st = $pdo->prepare("SELECT id, cep, rua, numero, complemento, bairro, cidade, uf FROM enderecos WHERE usuario_id=? ORDER BY id DESC LIMIT 1");
$st->execute([$uid]);
$end = $st->fetch();
$user["endereco"] = $end ?: null;

echo json_encode(["logged"=>true, "user"=>$user]);
?>
