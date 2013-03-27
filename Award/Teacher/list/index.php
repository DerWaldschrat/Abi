<?php
define("IN", "../../../");
define("__EXEC", true);
define("PHP_EX", ".php");

require IN . "coreconfig" . PHP_EX;
require IN . "mapper" . PHP_EX;

if (isLoggedin(1)) {
	
	get(function () {
		$db = db();
		$result = $db->query("SELECT teacherid, name FROM " . TEACHER);
		$json = array();
		while ($row = $result->fetch_object()) {
			$json[] = $row;
		}
		hJSON($json);
	});
}
?>