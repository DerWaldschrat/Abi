<?php
define("__EXEC", true);
define("IN", "../");
define("PHP_EX", ".php");
require IN . "coreconfig" . PHP_EX;
require IN . "mapper" . PHP_EX;
require IN . "validator" . PHP_EX;

if (isLoggedin()) {
    // Get request for loading your own data
    get(function () {
        $db = db();
        $sql = "SELECT dataid, categoryid, `value` FROM " . DATA . " WHERE userid = " . userField("userid");
        $result = $db->query($sql);
        $json = array();
        if ($result instanceof mysqli_result) {
            while ($r = $result->fetch_object()) {
                $json[] = $r;
            }
        }
        hJSON($json);
    });

    // Create new instance
    post(function () {
        $body = bodyAsJSON();
        if (hasAllSetIsset($body, array("categoryid", "value"))) {
            $db = db();
            $sql = "INSERT INTO ". DATA . " (categoryid, `value`, userid) VALUES(?, ?, " . userField("userid") . ")";
            $st = $db->prepare($sql);
            $st->bind_param("is", $body->categoryid, $body->value);
            if (exQuery($st)) {
                hJSON(array("dataid" => $db->insert_id));
            } else {
                fail("dataSaveFail");
            }
        } else {
            fail("dataSaveFail");
        }
    });

    // Update an instance
    put(function () {
        $body = bodyAsJSON();
        if (hasAllSetIsset($body, array("value", "dataid"))) {
            $db = db();
            $sql = "UPDATE ". DATA . " SET `value` = ? WHERE dataid = ? AND userid = " . userField("userid");
            $st = $db->prepare($sql);
            $st->bind_param("si", $body->value, $body->dataid);
            if (exQuery($st)) {
                hJSON($body);
            } else {
                fail("dataSaveFail");
            }
        } else {
            fail("dataSaveFail");
        }
    });
}

?>