<?php
define("__EXEC", true);
define("IN", "../../");
define("PHP_EX", ".php");

require IN . "coreconfig" . PHP_EX;
require IN . "mapper" . PHP_EX;
require IN . "validator" . PHP_EX;
if(isLoggedin(1)) {
    function ownsImage($imageid) {
        // Check if person owns this image
        $sql = "SELECT fromid FROM " . IMAGE . " WHERE imageid = ?";
        $db = db();
        $st = $db->prepare($sql);
        $st->bind_param("i", $imageid);
        $st->bind_result($ownerid);
        $st->execute();
        $st->fetch();
        $st->close();
        return $ownerid == userField("userid");
    }
    post(function () {
        $body = bodyAsJSON();
        if (hasAllSetIsset($body, array("x", "y", "toid", "imageid"))) {
            // Owns image, so we can continue to store mark
            if (ownsImage($body->imageid)) {
                $sql = "INSERT INTO " . MARK . " (fromid, imageid, toid, x, y) VALUES (?, ?, ?, ?, ?)";
                $db = db();
                $st = $db->prepare($sql);
                $resp = new stdClass();
                $resp->fromid = userField("userid");
                $st->bind_param("iiiii", $resp->fromid, $body->imageid, $body->toid, $body->x, $body->y);
                if (exQuery($st)) {
                    $resp->markid = $st->insert_id;
                    hJSON($resp);
                } else {
                    fail("markSaveFail");
                }
            } else {
                fail("imageNotOwned");
            }
        } else {
            fail("markNameMissing");
        }
    });
    
    put(function () {
        $body = bodyAsJSON();
        if (hasAllSetIsset($body, array("x", "y", "toid", "imageid", "markid"))) {
            if (ownsImage($body->imageid)) {
                $fromid = userField("userid");
                $sql = "UPDATE " . MARK . " SET toid = ?, x = ?, y = ? WHERE markid = ? AND fromid = ?";
                $st = db()->prepare($sql);
                $st->bind_param("iiiii", $body->toid, $body->x, $body->y, $body->markid, $fromid);
                if (exQuery($st)) {
                    hJSON();
                    echo "{}";
                } else {
                    fail("markUpdateFail");
                }
            } else {
                fail("imageNotOwned");
            }
        } else {
            fail("markNameMissing");
        }
    });
    delete(function () {
        $query = $_SERVER["QUERY_STRING"];
        if (is_numeric($query)) {
            $fromid = userField("userid");
            $sql = "DELETE FROM " . MARK . " WHERE markid = ? AND fromid = ?";
            $st = db()->prepare($sql);
            $st->bind_param("ii", $query, $fromid);
            if (exQuery($st)) {
                
            } else {
                fail("markDestroyFail");
            }
        } else {
            h404();
        }
    });
}
?>