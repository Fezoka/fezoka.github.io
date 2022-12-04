<?php

$HOST = "localhost";
$USER = "root";
$PASS = "";
$DB  = "users";


$mysqli = new mysqli($HOST, $USER, $PASS, $DB);

if ($mysqli->error) {
    die("Não foi possível estabelecer uma conexão. Erro: " . $mysqli->error);
}