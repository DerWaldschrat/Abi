<?php
define("__EXEC", true);
define("IN", "../");
define("PHP_EX", ".php");

require IN . "coreconfig" . PHP_EX;
require IN . "mapper" . PHP_EX;
require IN . "validator" . PHP_EX;

if (isLoggedin()) {
    // When the user is updated
    put(function () {
        $user = bodyAsJSON();
        $userid = isset($_SERVER["QUERY_STRING"]) ? (int)$_SERVER["QUERY_STRING"] : -1;
        $loggedid = userField("userid");
        if (!hasAllSet($user, array("userid"))) {
            h404();
        } else {
            if ($user->userid !== $userid || $user->userid !== $loggedid) {
                h404();
            } else {
                $db = db();
                $toCheck = array("geburtstag" => "s", "strasse" => "s", "wohnort" => "s", "danksagung" => "s", "positiv" => "s", "negativ" => "s", "zukunft" => "s");
                foreach($toCheck as $checker => $type) {
                    if (!empty($user->$checker)) {
                        if($checker === "geburtstag") {
                            $user->geburtstag = dateChangeToISO($user->geburtstag);
                        }
                        $st = $db->prepare("UPDATE " . USER_DATA . " SET " . $checker . " = ? WHERE userid = ?");
                        $st->bind_param($type . "i", $user->$checker, $userid);
                        exQuery($st);
                    }
                }
                require IN . "User/fetchData" . PHP_EX;
                $usr = new stdClass();
                $usr->userid = $userid;
                fetchUserData($usr);
                echo json_encode($usr);
            }
        }
    });
    // User needs to be enabled for that
    if (isLoggedin(1)) {
        get(function () {
            // Actually, this is for the limitedusers, but it is good to have everything in this single file
            $db = db();
            $result = $db->query("SELECT userid, nickname, vorname, nachname, geschlecht, rights FROM " . USER . " WHERE vorname != ''");
            if ($result instanceof mysqli_result) {
                $json = array();
                while($row = $result->fetch_object()) {
                    $json[] = $row;
                }
                echo json_encode($json);
            }
        });
    // All other getrequests get an empty list   
    } else {
        get(function () {
            echo "[]";    
        });
    }
}
?>