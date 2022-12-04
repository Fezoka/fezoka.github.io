<?php
include("conexao.php");

$mensagem = "Seja Bem-vindo ao nosso sistema!";

// verificar a existência das variáveis
if( isset($_POST['email']) || isset($_POST['pass']))  {

    //verificar se o tamanho do email/senha é igual a 0
    if(strlen($_POST['email']) == 0){
        $mensagem =  "Preencha seu E-mail ! 😊";
    } else if (strlen($_POST['pass']) == 0){
        $mensagem = "Acho que você esqueceu da senha ! 😊";
    } else {

        // criando variáveis que contenham email/senha inseridos
        $email = $mysqli->real_escape_string($_POST['email']);
        $pass = $mysqli->real_escape_string($_POST['pass']);

        $sql_code = "SELECT * FROM login WHERE email = '$email' AND pass = '$pass'";
        $sql_query = $mysqli->query($sql_code) or die ('Falha na execução do código SQL: ' . $mysqli->error);

        $qnt = $sql_query->num_rows;

        if ($qnt == 1){

            $USER = $sql_query->fetch_assoc();

            if(!isset($_SESSION)) {
                session_start();
            }

            $_SESSION['id'] = $USER['id'];
            $_SESSION['name'] = $USER['name'];
            $_SESSION['email'] = $USER['email'];
            $_SESSION['pass'] = $USER['pass'];

            header("Location: painel.php");

        } else {
            $mensagem = "⚠️ Não foi possível encontrar sua conta ! ⚠️";
        }

    }


}


?>


<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="utf-8">
    <meta content="width=device-width, initial-scale=1.0" name="viewport">
    <meta content="" name="keywords">
    <meta content="" name="description">
    <title>Login - Seja Bem-vindo</title>
  
    <!-- Favicons -->
    <link href="../img/favicon.ico" rel="icon">
    <link href="../img/apple-touch-icon.png" rel="apple-touch-icon">
  
    <!-- CSS only -->
    <link href="css/main.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-rbsA2VBKQhggwzxH7pPCaAqO46MgnOM80zW1RWuH61DGLwZJEdK2Kadq2F9CUG65" crossorigin="anonymous">

    <!-- JavaScript Bundle with Popper -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-kenU1KFdBIe4zVF0s0G1M5b4hcpxyD9F7jL+jjXkk+Q2h455rYXK/7HAuoJl+0I4" crossorigin="anonymous"></script>
</head>

<body>

    <div class="container">
        <div class="row align-items-center ">
            <div class="cool-md-10 mx-auto col-lg-7 offset-md-3">
                <form class="shadow-lg p-4 p-md-5 bg-body rounded-3 bg-light border border-primary" action="" method="post">
                    <legend class="mb-3" style="text-align: center;">
                        <?php echo $mensagem ?>
                    </legend>
                    <div class="form-floating mb-3">
                        <input type="email" class="form-control" id="inputEmail" placeholder="login" name='email'>
                        <label for="inputEmail">E-mail</label>
                    </div>
                    <div class="form-floating mb-3">
                        <input type="password" class="form-control" id="inputPassword" placeholder="senha" name='pass'>
                        <label for="inputPassword">Senha</label>
                    </div>
                    <div class="checkbox mb-3">
                        <label>
                            <input type="checkbox" value="salvar"> Lembrar de mim
                        </label>
                    </div>
                    <button class="btn btn-lg btn-success rounded-pill" type="submit">Entrar</button>
                </form>
            </div>
        </div>
    </div>


</body>
</html>