<?php
//Redefine a senha do usuário por uma nova(na teoria deveria ser acessada por um link enviado por email com um token de segurança)

require __DIR__ . "/config.php";
header("Content-Type: application/json");

$token  = trim($_POST["token"] ?? "");
$senha  = $_POST["senha"] ?? "";
$senha2 = $_POST["senha2"] ?? "";

if (!$token) { echo json_encode(["ok"=>false,"error"=>"Token ausente"]); exit; }
if (strlen($senha) < 6) { echo json_encode(["ok"=>false,"error"=>"Senha curta"]); exit; }
if ($senha !== $senha2) { echo json_encode(["ok"=>false,"error"=>"Senhas diferentes"]); exit; }

$st = $pdo->prepare("SELECT id, usuario_id, expira_em, usado FROM password_resets WHERE token=?");
$st->execute([$token]);
$r = $st->fetch();

if (!$r || intval($r["usado"]) === 1 || strtotime($r["expira_em"]) < time()) {
  echo json_encode(["ok"=>false,"error"=>"Token inválido ou expirado"]); exit;
}

$hash = password_hash($senha, PASSWORD_DEFAULT);
$pdo->prepare("UPDATE usuarios SET senha_hash=? WHERE id=?")->execute([$hash, $r["usuario_id"]]);
$pdo->prepare("UPDATE password_resets SET usado=1 WHERE id=?")->execute([$r["id"]]);

echo json_encode(["ok"=>true]);
?>
