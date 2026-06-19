<?php
//Grava o pedido no banco de dados e retorna suas informações para o pagamento

require __DIR__ . "/config.php";
header("Content-Type: application/json");

if (empty($_SESSION["user_id"])) { echo json_encode(["ok"=>false,"error"=>"Faça login"]); exit; }
$uid = $_SESSION["user_id"];

$data = json_decode(file_get_contents("php://input"), true);
$items    = $data["items"]    ?? [];
$delivery = $data["delivery"] ?? "entrega";
$payment  = $data["payment"]  ?? "pix";
$notes    = trim($data["notes"] ?? "");

$allowedDelivery = ["entrega", "retirada"];
$allowedPayment = ["pix", "credito_online", "debito_online", "dinheiro_entrega", "cartao_entrega"];
if (!in_array($delivery, $allowedDelivery, true)) { echo json_encode(["ok"=>false,"error"=>"Entrega inválida"]); exit; }
if (!in_array($payment, $allowedPayment, true)) { echo json_encode(["ok"=>false,"error"=>"Pagamento inválido"]); exit; }
if (!is_array($items) || count($items) === 0) { echo json_encode(["ok"=>false,"error"=>"Sacola vazia"]); exit; }

$st = $pdo->prepare("SELECT id FROM enderecos WHERE usuario_id=? ORDER BY id DESC LIMIT 1");
$st->execute([$uid]);
$address = $st->fetch();
$addressId = $address ? $address["id"] : null;
if ($delivery === "entrega" && !$addressId) { echo json_encode(["ok"=>false,"error"=>"Cadastre um endereço"]); exit; }

$sub = 0;
foreach ($items as $it) {
  $qty = max(1, intval($it["qty"] ?? 1));
  $price = max(0, floatval($it["price"] ?? 0));
  $sub += $price * $qty;
}
$frete = $delivery === "entrega" ? 8.00 : 0.00;
$total = $sub + $frete;
$status = in_array($payment, ["pix", "credito_online", "debito_online"], true) ? "aguardando_pagamento" : "pendente";

try {
  $pdo->beginTransaction();

  $st = $pdo->prepare("INSERT INTO pedidos (usuario_id,endereco_id,total,frete,tipo_entrega,pagamento,observacoes,status) VALUES (?,?,?,?,?,?,?,?)");
  $st->execute([$uid, $addressId, $total, $frete, $delivery, $payment, $notes, $status]);
  $pid = $pdo->lastInsertId();

  $stI = $pdo->prepare("INSERT INTO pedido_itens (pedido_id,produto_id,produto_nome,preco_unit,quantidade) VALUES (?,?,?,?,?)");
  foreach ($items as $it) {
    $stI->execute([$pid, intval($it["id"] ?? 0), substr(trim($it["name"] ?? "Produto"), 0, 150), floatval($it["price"] ?? 0), max(1, intval($it["qty"] ?? 1))]);
  }

  $pdo->commit();
  echo json_encode(["ok"=>true,"order_id"=>$pid,"status"=>$status]);
} catch (Exception $e) {
  $pdo->rollBack();
  echo json_encode(["ok"=>false,"error"=>"Erro ao salvar pedido"]);
}
?>
