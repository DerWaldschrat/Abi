<?php
/**
 * The file containing the creating routine for teacher quotes
 */
define("__EXEC", true);
define("IN", "../");
define("PHP_EX", ".php");

require IN . "coreconfig" . PHP_EX;
require IN . "mapper" . PHP_EX;
// You need to be enabled for this action
if (isLoggedin(1)) {
    // For creating new quotes
    post(function () {
        $quote = bodyAsJSON();
        require IN . "validator" . PHP_EX;
        if (!hasAllSet($quote, array("userid", "content"))) {
            fail("quoteSaveFail");
        } else {
            if($quote->userid != userField("userid")) {
                h404();
            } else {
                if (hasRightLength($quote->content, 10)) {
                    $sql = "INSERT INTO " . QUOTE . " (userid, content) VALUES (?, ?)";
                    $db = db();
                    $st = $db->prepare($sql);
                    $st->bind_param("is", $quote->userid, $quote->content);
                    if (exQuery($st)) {
                        hJSON(array("quoteid" => $st->insert_id));
                    } else {
                        fail("quoteSaveFail");
                    }
                } else {
                    fail("quoteTooShort");
                }
            }

        }
    });

    // For loading all the old ones
    get(function () {
        $userid = userField("userid");
        $db = db();
        $result = $db->query("SELECT quoteid, content FROM " . QUOTE . " WHERE userid = " . $userid);
        if ($result instanceof mysqli_result) {
            $json = array();
            while($res = $result->fetch_object()) {
                $json[] = $res;
            }
            hJSON(json_encode($json));
        } else {
            fail("quotesNotFound");
        }
    });

    // For deleting a quote
    delete(function () {
        $userid = userField("userid");
        $quoteid = isset($_SERVER["QUERY_STRING"]) ? $_SERVER["QUERY_STRING"] : -1;
        $db = db();
        $st = $db->prepare("DELETE FROM " . QUOTE . " WHERE userid = ? AND quoteid = ?");
        $st->bind_param("ii", $userid, $quoteid);
        if (exQuery($st) === false) {
            fail("quoteDeleteFail");
        }
    });
}
?>