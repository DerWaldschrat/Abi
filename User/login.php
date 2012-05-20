<?php
define("__EXEC", true);
define("IN", "../");
define("PHP_EX", ".php");
require IN . "coreconfig" . PHP_EX;
require IN . "validator" . PHP_EX;
require IN . "mapper" . PHP_EX;
require IN . "hasher" . PHP_EX;

post(function () {
    $userIn = bodyAsJSON();
    if (hasAllSet($userIn, array("nickname", "passwort"))) {
        $db = db();
        $oldPw = $userIn->passwort;
        $userIn->passwort = hashme($userIn->passwort, $userIn->nickname);
        $st = $db->prepare("SELECT userid, email, vorname, nachname, passwort, profile, rights FROM " . USER . " WHERE nickname = ?");
        $st->bind_param("s", $userIn->nickname);
        $user = new stdClass();
        $st->bind_result($user->userid, $user->email, $user->vorname, $user->nachname, $user->passwort, $user->profile, $user->rights);
        if ($st->execute()) {
            $st->store_result();
            if ($st->num_rows === 1) {
                $st->fetch();
                if ($user->passwort === $userIn->passwort) {
                    $user->nickname = $userIn->nickname;
                    $st->close();
                    $_SESSTION["user"] = array();
                    $toSet = array("userid", "email", "vorname", "nachname", "profile", "rights");
                    foreach($toSet as $field) {
                        $_SESSION["user"][$field] = $user->$field;
                    }
                    $_SESSION["user"]["loggedin"] = true;
                    require IN . "User/fetchData" . PHP_EX;
                    fetchUserData($user);
                    echo json_encode($user);
                }
            } else {
                h404();
            }
        } else {
            h404();
        }
    } else {
        h404();
    }
});


?>