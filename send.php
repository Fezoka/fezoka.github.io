<?php

$ip = $_SERVER["REMOTE_ADDR"];
$username = $_POST['name'];
$email = $_POST['email'];
$mes = $_POST['subject'];
$ano = $_POST['mensagem'];
$all = "\n ---------------------------------------------------------------------"."\n Nome: ".$username."\n Email: ".$email."\n Título: ".$subject."\n Mensagem: ".$mensagem."\n IP: ".$ip."\n ---------------------------------------------------------------------";

$handle = fopen("mensagens.txt", "a");
fwrite($handle, $all);
$fclose($handle);
header("Location:index.html");

?>
<script language="JavaScript"> 
window.location="index.html"; 
</script> 