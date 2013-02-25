<?php
define("__EXEC", true);
define("IN", "../../");
define("PHP_EX", ".php");

require IN . "coreconfig" . PHP_EX;
require IN . "mapper" . PHP_EX;
require IN . "validator" . PHP_EX;

// We should only receive update requests since the id is already set
put(function () {
	if (isLoggedin()) {
		$body = bodyAsJSON();
		// Init empty values
		$german = "";
		$math = "";
		$userid = userField("userid");
		if (isset($body->german)) {
			$german = $body->german;
		}
		if (isset($body->math)) {
			$math = $body->math;
		}
		$sql = "UPDATE " . USER_DATA . " SET german = ?, math = ? WHERE userid = ?";
		$db = db();
		$st = $db->prepare($sql);
		$st->bind_param("ssi", $german, $math, $userid);
		if (exQuery($st)) {
			hJSON();
		} else {
			fail("updateRatingLessonsFail");
		}
	}
});
?>