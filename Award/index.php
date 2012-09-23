<?php
define("__EXEC", true);
define("IN", "../");
define("PHP_EX", ".php");

require IN . "coreconfig" . PHP_EX;
require IN . "mapper" . PHP_EX;
require IN . "validator" . PHP_EX;

if(isLoggedin(1)) {
    // Fetch all awards
    get(function () {
        require IN . "Award/fetchAll" . PHP_EX;
        $categories = fetchCategoriesAll();
        // There are no categories at all, we leave it at this
        if ($categories === array()) {
            hJSON();
            echo "[]";
        } else {
            $userid = userField("userid");
            $db = db();
            $awards = array();
            $result = $db->query("SELECT awardid, maleid, femaleid, categoryid, userid FROM " . AWARD . " WHERE userid = " . $userid);
            if($result instanceof mysqli_result) {
                while($row = $result->fetch_object()) {
                    $awards[$row->categoryid] = $row;
                }
            }
            $json = array();
            foreach($categories as $categoryid => $category) {
                $award = null;
                if (!array_key_exists($categoryid, $awards)) {
                    require_once IN . "Award/createAward" . PHP_EX;
                    $award = new stdClass();
                    awardDefaults($award);
                    $award->awardid = createAward($categoryid, $userid);
                    $award->userid = $userid;
                    $award->categoryid = $categoryid;
                } else {
                    $award = $awards[$categoryid];
                }
                $award->title = $category->title;
                $json[] = $award;
            }
            hJSON();
            echo json_encode($json);
        }
    });

    // Create new categories
    post(function () {
        $category = bodyAsJSON();
        if (hasAllSet($category, array("title", "userid")) && $category->userid == userField("userid")) {
            $db = db();
            $st = $db->prepare("INSERT INTO " . CATEGORY . " (title, userid) VALUES (?, ?)");
            $st->bind_param("si", $category->title, $category->userid);
            if (exQuery($st)) {
                hJSON();
                $categoryid = $st->insert_id;
                require IN . "Award/createAward" . PHP_EX;
                $awardid = createAward($categoryid, $category->userid);
                if ($awardid === -1) {
                    fail("categorySaveFail");
                } else {
                    $award = new stdClass();
                    awardDefaults($award);
                    $award->categoryid = $categoryid;
                    $award->awardid = $awardid;
                    hJSON();
                    echo json_encode($award);
                }
            } else {
                fail("categorySaveFail");
            }
        } else {
            fail("categorySaveFail");
        }
    });

    // Receive updates for the awards
    put(function () {
        $award = bodyAsJSON();
        if(hasAllSet($award, array("userid", "categoryid", "awardid")) && $award->userid == userField("userid")) {
            require IN . "Award/createAward" . PHP_EX;
            awardDefaults($award);
            $db = db();
            $st = $db->prepare("UPDATE " . AWARD . " SET maleid = ?, femaleid = ? WHERE userid = ? AND categoryid = ?");
            $st->bind_param("iiii", $award->maleid, $award->femaleid, $award->userid, $award->categoryid);
            if(!exQuery($st)) {
                fail("awardSaveFail");
            }
        } else {
            fail("awardSaveFail");
        }
    });

    // Delete awards, only allowed level 3-members
    if (isLoggedin(3)) {
        delete(function () {
            $q = $_SERVER["QUERY_STRING"];
            $category = null;
            if (preg_match("#^[0-9]+$#", $q) == 1) {
                $db = db();
                $st = $db->prepare("SELECT categoryid FROM " . AWARD . " WHERE awardid = ?");
                $st->bind_param("i", $q);
                $st->bind_result($category);
                $st->execute();
                $st->store_result();
                if ($st->num_rows == 1) {
                    $st->fetch();
                    $st->close();
                    $st = $db->prepare("DELETE FROM " . CATEGORY . " WHERE categoryid = ?");
                    $st->bind_param("i", $category);
                    if (exQuery($st)) {
                        $st->close();
                        $st = $db->prepare("DELETE FROM " . AWARD . " WHERE categoryid = ?");
                        $st->bind_param("i", $category);
                        exQuery($st);
                    } else {
                        fail("awardDeleteFail" . $category);
                    }
                } else {
                    fail("awardDeleteFail2");
                }
            } else {
                fail("awardDeleteFail1");
            }
        });
    }

} else {
    h404();
}
?>