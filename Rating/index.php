<?php
define("__EXEC", true);
define("IN", "../");
define("PHP_EX", ".php");

require IN . "coreconfig" . PHP_EX;
require IN . "mapper" . PHP_EX;
require IN . "validator" . PHP_EX;

if (isLoggedin()) {
	// Just list all currently created ratings
	get(function () {
		$db = db();
		$sql = "SELECT ratingid, lesson, kursklima, zusammenhalt, kreativitaet, fairness, motivation FROM " . RATING . " WHERE userid = " . userField("userid");
		$result = $db->query($sql);
		$json = array();
		while ($row = $result->fetch_object()) {
			$json[] = $row;
		}
		hJSON($json);
	});
	
	$fields = array("kursklima", "zusammenhalt", "kreativitaet", "fairness", "motivation");
	function rangeField(&$body) {
		global $fields;
		foreach($fields as $field) {
			if ($body->$field < 0 ) {
				$body->$field = 0;
			}
			if ($body->$field > 15) {
				$body->$field = 15;
			}
		}
	}
	
	
	post(function () {
		global $fields;
		$body = bodyAsJSON();
		if (hasAllSetIsset($body, $fields) && hasAllSet($body, array("lesson"))) {
			rangeField($body);
			$db = db();
			$user = userField("userid");
			$st = $db->prepare("INSERT INTO " . RATING . " (lesson, kursklima, zusammenhalt, kreativitaet, fairness, motivation, userid) VALUES (?, ?, ?, ?, ?, ?, " . $user . ")");
			$st->bind_param("siiiii", $body->lesson, $body->kursklima, $body->zusammenhalt, $body->kreativitaet, $body->fairness, $body->motivation);
			if (exQuery($st)) {
				$body->ratingid = $db->insert_id;
				hJSON($body);
			} else {
				fail("insertRatingFail");
			}
		} else {
			fail("ratingNotComplete");
		}
	});
	put(function () {
		global $fields;
		$body = bodyAsJSON();
		if (hasAllSetIsset($body, $fields) && hasAllSet($body, array("ratingid"))) {
			rangeField($body);
			$db = db();
			$user = userField("userid");
			$st = $db->prepare("UPDATE " . RATING . " SET kursklima = ?, zusammenhalt = ?, kreativitaet = ?, fairness = ?, motivation = ? WHERE userid = " . $user . " AND ratingid = ?");
			$st->bind_param("iiiiii", $body->kursklima, $body->zusammenhalt, $body->kreativitaet, $body->fairness, $body->motivation, $body->ratingid);
			if (exQuery($st)) {
				hJSON();
			} else {
				fail("updateRatingFail");
			}
		} else {
			fail("ratingNotComplete");
		}
	});
}
?>