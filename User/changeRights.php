<?php
define("__EXEC", true);
define("IN", "../");
define("PHP_EX", ".php");

require IN . "coreconfig" . PHP_EX;
require IN . "mapper" . PHP_EX;
require IN . "validator" . PHP_EX;

// To change the rights of Users, you need to have at least the right 2
if (isLoggedin(2)) {
    // Update
    put(function () {
        $data = bodyAsJSON();
        // You cant change your own rights, and we need the rights to be changed
        if (!hasAllSetIsset($data, array("userid", "val")) || userField("userid") == $data->userid) {
            h404() ;
        } else {
            $rights = userField("rights");
            // You cant give higher rights than you have, or even the right you have
            if ($data->val > $rights) {
                $data->val = $rights;
            }
            $db = db();
            $st = $db->prepare("SELECT rights FROM " . USER . " WHERE userid = ?");
            $st->bind_param("i", $data->userid);
            $st->bind_result($momentright);
            $st->execute();
            $st->fetch();
            $st->close();
            if ($momentright <= userField("rights")) {
                $st = $db->prepare("UPDATE " . USER . " SET rights = ? WHERE userid = ?");
                $st->bind_param("ii", $data->val, $data->userid);
                if (exQuery($st)) {
                    hJSON(array("rights" => $data->val));
                } else {
                    h404();
                }    
            } else {
                h404();
            }
        }       
    });   
} else {
    h404();
}



?>