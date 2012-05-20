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
    if (hasAllSet($userdata, array("nickname", "vorname", "nachname", "passwort", "email", "geschlecht"))) {
        $nick = $userdata->nickname;
        $vor = $userdata->vorname;
        $nach = $userdata->nachname;
        $pass = $userdata->passwort;
        $email = $userdata->email;
        if (hasRightLength($nick, 3, 60) && hasRightLength($vor, 2, 60) && hasRightLength($nach, 2, 60) && hasRightLength($pass, 2, 60) && isEmail($email)) 
        {
            $hashToUser = md5(time()) . md5($nick . $vor) . md5($nach);
            require IN . "hasher" . PHP_EX;
            $userdata->passwort = hashme($pass, $nick);
            // Insert user in database with no password
            $db = db();
            $st = $db->prepare("INSERT INTO " . USER . "(nickname, email) VALUES(?, ?)");
            $st->bind_param("ss", $nick, $email);
            if (exQuery($st)) {
                $userdata->userid = $st->insert_id;
                $st->close();
                $st = $db->prepare("INSERT INTO " . USER_DATA . " (userid) VALUES (?)");
                $st->bind_param("i", $userdata->userid);
                if(exQuery($st)) {
                    file_put_contents(IN . "__registered/" . $hashToUser . ".json", json_encode($userdata));
                    $mail($email, "Registrierung", "Hallo " . $nick . ",\nvielen Dank für die Registrierung.\nMit dem folgenden Link kannst du deinen Account aktivieren:\n".getUrlToPath("registerconfirm.php?".$hashToUser)."\n");
                } else {
                    fail("registrationFail");
                }
            } else {
                fail("registrationFail");
            }        
        } else {
            fail("registrationValid");
        }  
    } else {
        fail("needAllFields");
    }
});



?>