<?php
define("IN", "../../");
define("__EXEC", true);
define("PHP_EX", ".php");

require IN . "coreconfig" . PHP_EX;
require IN . "mapper" . PHP_EX;

function awardDefaultsTeacher(&$award) {
	if (!property_exists($award, "firstid")) {
        $award->firstid = -1;
    }
    if (!property_exists($award, "secondid")) {
        $award->secondid = -1;
    }
	if (!property_exists($award, "thirdid")) {
		$award->thirdid = -1;
	}
}

if (isLoggedin(1)){
	get(function () {
		require IN . "Award/fetchAll" . PHP_EX;
        $categories = fetchCategoriesAll(TEACHER_CATEGORY);
        // There are no categories at all, we leave it at this
        if ($categories === array()) {
            hJSON(array());
        } else {
			$userid = userField("userid");
            $db = db();
            $awards = array();
			$result = $db->query("SELECT awardid, firstid, secondid, thirdid, categoryid, userid FROM " . TEACHER_AWARD . " WHERE userid = " . $userid);
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
                    awardDefaultsTeacher($award);
                    $award->awardid = createAward($categoryid, $userid, TEACHER_AWARD);
                    $award->categoryid = $categoryid;
                } else {
                    $award = $awards[$categoryid];
                }
                $award->title = $category->title;
                $json[] = $award;
			}
			hJSON($json);
		}
	});
	
	// Receive updates for the awards
    put(function () {
		require IN . "validator" . PHP_EX;
        $award = bodyAsJSON();
        if(hasAllSet($award, array("categoryid", "awardid"))) {
            awardDefaultsTeacher($award);
			$userid = userField("userid");
            $db = db();
            $st = $db->prepare("UPDATE " . TEACHER_AWARD . " SET firstid = ?, secondid = ?, thirdid = ? WHERE userid = ? AND categoryid = ?");
            $st->bind_param("iiiii", $award->firstid, $award->secondid, $award->thirdid, $userid, $award->categoryid);
            if(!exQuery($st)) {
                fail("awardSaveFail");
            }
        } else {
            fail("awardSaveFail");
        }
    });
}

?>