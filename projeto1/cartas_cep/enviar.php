<?php

$ip = $_SERVER["REMOTE_ADDR"];
$med1_cav1 = $_POST['med1_cav1'];
$all = "\n ---------------------------------------------------------------------"."Medida 1: \n Cavidade 1 :".$med1_cav1."\n ---------------------------------------------------------------------";

$handle = fopen("output.txt", "a");
fwrite($handle, $all);
$fclose($handle);
header("Location:form.html");

?>
<script language="JavaScript"> 
window.location="form.html"; 
</script> 