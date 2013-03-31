<?php
define("__EXEC", true);
define("IN", "../");
define("PHP_EX", ".php");

require IN . "coreconfig" . PHP_EX;
require IN . "mapper" . PHP_EX;
// You have to be a member of the team
if (isLoggedin(3)) {
    get(function () {
        $allowed = array("awardFemale" => "SELECT COUNT(femaleid) AS cm, femaleid AS id FROM `" . AWARD . "` WHERE femaleid !=0 AND femaleid != -1 AND categoryid = ?? GROUP BY categoryid, femaleid ORDER BY cm DESC",
                         "awardMale" => "SELECT COUNT(maleid) AS cm, maleid AS id FROM `" . AWARD . "` WHERE maleid !=0 AND maleid != -1 AND categoryid = ?? GROUP BY categoryid, maleid ORDER BY cm DESC",
                         "categories" => "SELECT categoryid AS id, title FROM " . CATEGORY,
						 "teacherAwardFirst" => "SELECT count(firstid) as cf, firstid AS id FROM `" . TEACHER_AWARD . "` WHERE firstid != -1 AND categoryid = ?? GROUP BY categoryid, firstid ORDER BY cf DESC",
						 "teacherAwardSecond" => "SELECT count(secondid) as cs, secondid AS id FROM `" . TEACHER_AWARD . "` WHERE secondid != -1 AND categoryid = ?? GROUP BY categoryid, secondid ORDER BY cs DESC",
						 "teacherAwardThird" => "SELECT count(thirdid) as ct, thirdid AS id FROM `" . TEACHER_AWARD . "` WHERE thirdid != -1 AND categoryid = ?? GROUP BY categoryid, thirdid ORDER BY ct DESC",
						 "teacherCategories" => "SELECT categoryid AS id, title FROM " . TEACHER_CATEGORY,
						 "teacherList" => "SELECT teacherid AS id, name FROM " . TEACHER, 
                         "commentFrom" => "SELECT COUNT( fromid ) AS fc, fromid AS id FROM " . COMMENT . " GROUP BY fromid ORDER BY fromid ASC",
                         "commentTo" => "SELECT COUNT( toid ) AS tc, toid AS id FROM " . COMMENT . " GROUP BY toid ORDER BY toid ASC",
						 "imagePreview" => "SELECT name FROM " . IMAGE . " ORDER BY imageid",
						 "quotes" => "SELECT userid, content FROM " . QUOTE,
						 "data" => "SELECT categoryid AS id, userid, `value` FROM " . DATA . " WHERE `value` IS NOT NULL AND categoryid = ??");
        if (isset($allowed[$_GET["query"]])) {
            $sql = $allowed[$_GET["query"]];
            if (isset($_GET["param"]) && is_numeric($_GET["param"])) {
                $sql = str_replace("??", $_GET["param"], $sql);
            }
            $result = db()->query($sql);
            $json = array();
            while ($row = $result->fetch_object()) {
                $json[] = $row;
            }
            hJSON($json);
        } else {
            h404();
        }
    });
} else {
    h404();
}
?>