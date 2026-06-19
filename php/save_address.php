<?php
//Salva novo endereço do usuário logado

require __DIR__ . "/config.php";
header("Content-Type: application/json");

if (empty($_SESSION["user_id"])) { echo json_encode(["ok"=>false,"error"=>"Faça login"]); exit; }
$uid = $_SESSION["user_id"];

$cep = trim($_POST["cep"] ?? "");
$rua = trim($_POST["rua"] ?? "");
$num = trim($_POST["numero"] ?? "");
$comp = trim($_POST["complemento"] ?? "");
$bairro = trim($_POST["bairro"] ?? "");
$cidade = trim($_POST["cidade"] ?? "");
$uf = strtoupper(trim($_POST["uf"] ?? ""));

if (!$cep || !$rua || !$num || !$bairro || !$cidade || strlen($uf)!=2) {
  echo json_encode(["ok"=>false,"error"=>"Preencha todos os campos obrigatórios"]); exit;
}

$st = $pdo->prepare("INSERT INTO enderecos (usuario_id,cep,rua,numero,complemento,bairro,cidade,uf) VALUES (?,?,?,?,?,?,?,?)");
$st->execute([$uid,$cep,$rua,$num,$comp,$bairro,$cidade,$uf]);

echo json_encode(["ok"=>true]);
?>
