<?php
define("__EXEC", true);
define("IN", "../");
define("PHP_EX", ".php");
require IN . "coreconfig" . PHP_EX;
require IN . "mapper" . PHP_EX;
require IN . "validator" . PHP_EX;

post(function () {
    global $mail;
    $userdata = bodyAsJSON();
    if (hasAllSet($userdata, array("passwort", "email"))) {
        $pass = $userdata->passwort;
        $email = $userdata->email;
        require IN . "hasher" . PHP_EX;
        require IN . "random" . PHP_EX;
        
        // Lookup user with email adress
        $st = db()->prepare("SELECT userid, nickname, vorname, nachname, geschlecht, email FROM " . USER . " WHERE email = ?");
        $st->bind_param("s", $email);
        $st->bind_result($userdata->userid, $userdata->nickname, $userdata->vorname, $userdata->nachname, $userdata->geschlecht, $userdata->email);
        if ($st->execute()) {
            $st->store_result();
            $st->fetch();
            if ($st->num_rows === 1 && $email == $userdata->email) {
                $userdata->passwort = hashme($pass, $userdata->nickname);
                
                $file = strtolower($userdata->passwort . randomString(56));
                file_put_contents(IN . "__registered/" . $file . ".json", json_encode($userdata));
                $mail($email, "Passwortänderung & Nicknamecheck", "Hallo " . $userdata->vorname . " " . $userdata->nachname . ",\n"
                . " dein Nickname lautet: " . $userdata->nickname
                . "\n Dein Passwort wird auf " . $pass . " zurückgesetzt, wenn du folgenden Link anklickst:"
                . "\n" . getUrlToPath("registerconfirm.php?".$file)
                . "\nViel Spaß weiterhin!");        
            } else {
                fail("noValidEmail");
            }             
        } else {
            fail();
        }
    } else {
        fail("needAllFields");
    }
}, true);




?>