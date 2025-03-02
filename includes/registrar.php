<?php

include("includes/con_db.php");

if (isset($_POST['contact'])) {

    if (strlen($_POST['name']) >= 1 && 
        strlen($_POST['email']) >= 1 &&
        strlen($_POST['direction']) >= 1 &&
        strlen($_POST['phone']) >= 1 &&
        strlen($_POST['message']) >= 1) {
        $name = trim($_POST['name']);
        $email = trim($_POST['email']);
        $direction = trim($_POST['direction']);
        $phone = trim($_POST['phone']);
        $message = trim($_POST['message']);
        $fechareg = date("d/m/y");
        $consulta = "INSERT INTO datos(nombre, email, direccion, telefono, mensaje, fecha) VALUES ('$name','$email','$direction','$phone','$message','$fechareg')";
        $resultado = mysqli_query($conex,$consulta);
       if ($resultado) {
            ?>
            <h3>¡El mensaje ha sido enviado correctamente!</h3>
            <?php
        } else {
            ?>
            <h3>¡Ha ocurrido un error!</h3> 
            <?php
        }
        
    }   else {
            ?>
            <h3>Complete todos los campos</h3>
            <?php
    }     

}

?>