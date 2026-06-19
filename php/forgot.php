<?php
//DEVERIA enviar um token e gerar um email para o usuário com um link para criar nova senha

require __DIR__ . "/config.php";
header("Content-Type: application/json");

$email = trim($_POST["email"] ?? "");
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
  echo json_encode(["ok"=>false,"error"=>"E-mail inválido"]); exit;
}

$st = $pdo->prepare("SELECT id, nome FROM usuarios WHERE email=?");
$st->execute([$email]);
$u = $st->fetch();

$response = ["ok" => true];

if ($u) {
  $token = bin2hex(random_bytes(32));
  $expira = date("Y-m-d H:i:s", time() + 3600);
  $pdo->prepare("INSERT INTO password_resets (usuario_id,token,expira_em) VALUES (?,?,?)")
      ->execute([$u["id"], $token, $expira]);

  $link = rtrim($SITE_URL, "/") . "/redefinir.html?token=" . urlencode($token);
  $assunto = "Recuperar senha - Delicias & Gostosuras";

  $html = "
    <html><body style='font-family:Arial,sans-serif;background:#f6f6f6;padding:20px'>
      <div style='max-width:520px;margin:auto;background:#fff;padding:24px;border-radius:12px'>
        <h2>Recuperar senha</h2>
        <p>Olá, " . htmlspecialchars($u["nome"]) . ".</p>
        <p>Recebemos um pedido para redefinir sua senha.</p>
        <p><a href='" . htmlspecialchars($link) . "' style='display:inline-block;background:#4f8cff;color:#fff;padding:12px 18px;border-radius:999px;text-decoration:none'>Criar nova senha</a></p>
        <p>Este link vale por 1 hora. Se não foi você, ignore este e-mail.</p>
      </div>
    </body></html>";

  $headers  = "MIME-Version: 1.0\r\n";
  $headers .= "Content-type: text/html; charset=UTF-8\r\n";
  $headers .= "From: Delicias e Gostosuras <" . $STORE_EMAIL . ">\r\n";
  $headers .= "Reply-To: " . $STORE_EMAIL . "\r\n";

  $sent = @mail($email, $assunto, $html, $headers);

  if (!$sent && !$RESET_DEBUG_MODE) {
    echo json_encode(["ok"=>false,"error"=>"O servidor não conseguiu enviar o e-mail. Configure um e-mail profissional/SMTP."]); exit;
  }

  if ($RESET_DEBUG_MODE) {
    $response["debug_link"] = $link;
    $response["mail_sent"] = $sent;
  }
}

echo json_encode($response);
?>
