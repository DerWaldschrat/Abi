<?php
define("__EXEC", true);
define("IN", "../../");
define("PHP_EX", ".php");

require IN . "coreconfig" . PHP_EX;
require IN . "mapper" . PHP_EX;
require IN . "validator" . PHP_EX;

define("ABIBALL", $pre . "abiball");
define("DEFAULT_VALUE", 1);
if (isLoggedin(1)) {
	get(function () {
		$db = db();
		$user = userField("userid");
		$query = $db->query("SELECT vote FROM " . ABIBALL . " WHERE userid = " .$user);
		$obj = $query->fetch_object();
		// No entry, insert new one
		if ($obj === null) {
			$db->query("INSERT INTO " . ABIBALL . "(userid, vote) VALUES(" . $user . ", " . DEFAULT_VALUE . ")");
			hJSON(array("vote" => DEFAULT_VALUE));
		} else {
			hJSON($obj);
		}
	});
	post(function () {
		$body = bodyAsJSON();
		if (hasAllSet($body, array("vote"))) {
			$user = userField("userid");
			$db = db();
			$st = $db->prepare("UPDATE " . ABIBALL . " SET vote = ? WHERE userid = ?");
			$st->bind_param("ii", $body->vote, $user);
			if(!exQuery($st)) {
				h404();
			}
		}
	});
}

?>