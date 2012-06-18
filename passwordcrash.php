<?php
    $hash = "";
    require "hasher.php";
    if (isset($_POST["nick"]) && isset($_POST["pass"])) {
        $hash = hashme($_POST["pass"], $_POST["nick"]);
    }
?><!DOCTYPE html>
<html>

<head>
    <title>Passwortcrash</title>

    <meta charset="UTF-8" />

</head>

<body>
    <form action="passwordcrash.php" method="post">
    <label for="nick">Nickname:</label><input type="text" id="nick" name="nick" /><br />
    <label for="pass">Passwort:</label><input type="text" id="pass" name="pass" /><br />
    <input type="submit" value="Generiere Hash" /><br />
    </form>
    <?php echo $hash; ?>
</body>
</html>