<?php
define("__EXEC", true);
define("IN", "../");
define("PHP_EX", ".php");
require IN . "coreconfig" . PHP_EX;
require IN . "validator" . PHP_EX;
require IN . "mapper" . PHP_EX;
require IN . "hasher" . PHP_EX;
ini_set("log_errors", 1);
ini_set("error_log", "log/log.txt");

post(function () {
    global $crypt;
    $userIn = bodyAsJSON();
    if (hasAllSet($userIn, array("nickname", "passwort"))) {
        $db = db();
        $oldPw = $userIn->passwort;
        $userIn->passwort = hashme($userIn->passwort, $userIn->nickname);
        $st = $db->prepare("SELECT userid, email, vorname, nachname, passwort, profile, cat, rights, galeria, new_vote FROM " . USER . " WHERE nickname = ?");
        $st->bind_param("s", $userIn->nickname);
        $user = new stdClass();
        $st->bind_result($user->userid, $user->email, $user->vorname, $user->nachname, $user->passwort, $user->profile, $user->cat, $user->rights, $user->galeria, $user->new_vote);
        if ($st->execute()) {
            $st->store_result();
            if ($st->num_rows === 1) {
                $st->fetch();
                if ($user->passwort === $userIn->passwort) {
                    $user->nickname = $userIn->nickname;
                    $st->close();
                    // Create new cat
                    require IN . "random" . PHP_EX;
                    $cat = randomString(12);
                    $st = $db->prepare("UPDATE " . USER . " SET cat = ? WHERE nickname = ?");
                    $st->bind_param("ss", $cat, $user->nickname);
                    if (exQuery($st)) {
                        $user->cat = $cat;
                    }
                    // Create hash of Username
                    $user->nickhash = md5($user->nickname);
                    
                    /*// Create entry for .htpasswd
                    $file = file_get_contents(IN . ".htpasswd");
                    $pos = strpos($file, $user->nickhash);
                    if ($pos === false) {
                    } else {
                        $file = preg_replace("|" . $user->nickhash . ':([a-zA-Z0-9/.$]+)|', "", $file);
                        $file = str_replace("\n\n", "\n", $file);
                    }
                    $file .= "\n".$user->nickhash . ":" . $crypt($user->cat);
                    file_put_contents(IN . ".htpasswd", $file);
                    //sleep(1);*/
                    $_SESSTION["user"] = array();
                    $toSet = array("userid", "email", "vorname", "nachname", "profile", "cat", "rights", "galeria", "nickhash", "new_vote");
                    foreach($toSet as $field) {
                        $_SESSION["user"][$field] = $user->$field;
                    }
                    $_SESSION["user"]["loggedin"] = true;
                    require IN . "User/fetchData" . PHP_EX;
                    fetchUserData($user);
                    hJSON($user);
                } else {
                    h404();
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
}, true);


?>