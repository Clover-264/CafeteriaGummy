<?php
//encerrar sessão do usuário

require __DIR__ . "/config.php";
header("Content-Type: application/json");
session_destroy();
echo json_encode(["ok"=>true]);
?>
