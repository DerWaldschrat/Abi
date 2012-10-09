<?php
define("__EXEC", true);
define("IN", "../");
define("PHP_EX", ".php");
require IN . "coreconfig" . PHP_EX;
require IN . "mapper" . PHP_EX;

if (isLoggedin(1)) {
    // Get all terms in given interval
    get(function () {
       /* hJSON();
        echo file_get_contents("stress.json");
        exit;*/
        $dateRegex = "/[0-9]{4,4}-[0-1][0-9]-[0-3][1-9]/";
        // if it is valid date, we will (probably) not raise an sql error for that
        if (isset($_GET["from"]) && preg_match($dateRegex, $_GET["from"]) == 1 && isset($_GET["to"]) && preg_match($dateRegex, $_GET["to"]) == 1) {
            $from = $_GET["from"];
            $to = $_GET["to"];
            $sql = "SELECT termid, datum, title, description, target, fromid FROM " . TERM . " WHERE datum >= '" . $from . "' AND datum <= '" . $to . "'";
            $json = array();
            $db = db();
            $query = $db->query($sql);
            while($row = $query->fetch_object()) {
                $json[] = $row;
            }
            hJSON($json);
        } else {
            fail("noValidDate");
        }
    });
} else {
    h404();
}
?>