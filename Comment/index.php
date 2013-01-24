<?php
define("__EXEC", true);
define("IN", "../");
define("PHP_EX", ".php");
require IN . "coreconfig" . PHP_EX;
require IN . "mapper" . PHP_EX;
require IN . "validator" . PHP_EX;
if (isLoggedin()) {
    // For adding new comments you need to be enabled
    if (isLoggedin(1)) {
        // Save the new comment
        post(function () {
            $comment = bodyAsJSON();
            if (hasAllSet($comment, array("fromid", "toid", "content")) && $comment->fromid == userField("userid")) {
                if (true) {
                    $db = db();
                    $st = $db->prepare("INSERT INTO " . COMMENT . " (fromid, toid, content) VALUES (?, ?, ?)");
                    $st->bind_param("iis", $comment->fromid, $comment->toid, $comment->content);
                    if (exQuery($st)) {
                        $id = $st->insert_id;
                        hJSON();
                        echo json_encode(array("commentid" => $id));
                    } else {
                        fail("commentSaveFail");
                    }    
                }
                
            } else {
                fail("commentSaveFail");
            }
        });
        // Delete own comment
        delete(function () {
            $commentid = $_SERVER["QUERY_STRING"];
            if (is_numeric($commentid)) {
                $db = db();
                $fromid = userField("userid");
                $sql = "DELETE FROM " . COMMENT . " where fromid = ? AND commentid = ?";
                $st = $db->prepare($sql);
                $st->bind_param("ii", $fromid, $commentid);
                if (exQuery($st)) {

                } else {
                    fail("commentDestroyFail");
                }
            } else {
                fail("commentDestroyFail");
            }
        });
    }
    // Very simple here
    get(function () {
        $db = db();
        $result = $db->query("SELECT commentid, toid,content FROM " . COMMENT . " WHERE toid = " . userField("userid"));
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