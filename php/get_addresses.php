<?php
//Obtem lista de endereços do usuário logado

require __DIR__ . "/config.php";
header("Content-Type: application/json");

if (empty($_SESSION["user_id"])) {
  echo json_encode(["ok"=>false,"error"=>"Faça login"]); exit;
}

$uid = $_SESSION["user_id"];
$st = $pdo->prepare("SELECT id, cep, rua, numero, complemento, bairro, cidade, uf FROM enderecos WHERE usuario_id=? ORDER BY id DESC");
$st->execute([$uid]);

echo json_encode(["ok"=>true, "addresses"=>$st->fetchAll()]);
?>
