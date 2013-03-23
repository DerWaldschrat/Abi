<?php
define("__EXEC", true);
define("IN", "../");
define("PHP_EX", ".php");

require IN . "coreconfig" . PHP_EX;
require IN . "mapper" . PHP_EX;
require IN . "validator" . PHP_EX;

if (isLoggedin()) {
	post(function () {
		$body = bodyAsJSON();
		if (hasAllSetIsset($body, array("publish_ok", "publish_problems"))) {
			$db = db();
			$userid = userField("userid");
			$st = $db->prepare("UPDATE " . USER_DATA . " SET publish_ok = ?, publish_problems = ? WHERE userid = " . $userid);
			$st->bind_param("is", $body->publish_ok, $body->publish_problems);
			$st->execute();
		} else {
			h404();
		}
	}, true);
}
?>