<?php
// Gets the comments a user has send out
define("__EXEC", true);
define("IN", "../../");
define("PHP_EX", ".php");
require IN . "coreconfig" . PHP_EX;
require IN . "mapper" . PHP_EX;
require IN . "validator" . PHP_EX;
if (isLoggedin(1)) {
    // Very simple here
    get(function () {
        $db = db();
        $result = $db->query("SELECT commentid, toid, content FROM " . COMMENT . " WHERE fromid = " . userField("userid"));
        if ($result instanceof mysqli_result) {
            $row = array();
            while ($r = $result->fetch_object()) {
                $row[] = $r;
            }
            hJSON();
            echo json_encode($row);
        }
    });
} else {
    h404();
}
?>