<?php
define("__EXEC", true);
define("IN", "../");
define("PHP_EX", ".php");

require IN . "coreconfig" . PHP_EX;
require IN . "mapper" . PHP_EX;
// User needs to be enabled
if (isLoggedin(1)) {
    get(function () {
        $q = isset($_SERVER["QUERY_STRING"]) && is_numeric($_SERVER["QUERY_STRING"]) ? $_SERVER["QUERY_STRING"] : -1;
        if ($q == -1) {
            h404();
        } else {
            $user = new stdClass();
            $user->userid = $q;
            require IN . "User/fetchData" . PHP_EX;
            fetchUserData($user);
            if(!isset($user->strasse)) {
                $user->strasse = null;
                $user->wohnort = null;
                $user->geburtstag = null;
            }
            
            hJSON(array("geburtstag" => $user->geburtstag, "strasse" => $user->strasse, "wohnort" => $user->wohnort));
        }
    });
} else {
    h404();
}
