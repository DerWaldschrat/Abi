<?php
define("__EXEC", true);
define("IN", "../");
define("PHP_EX", ".php");

require IN . "coreconfig" . PHP_EX;
require IN . "mapper" . PHP_EX;
require IN . "User/fetchData" . PHP_EX;

if (isLoggedin(3)) {
	get(function () {
		if(isset($_SERVER["QUERY_STRING"]) && is_numeric($_SERVER["QUERY_STRING"])) {
			$userid = $_SERVER["QUERY_STRING"];
			$db = db();
			$user = new stdClass();
			$user->userid = $userid;
			// Fetch profile data
			fetchUserData($user);
			// Fetch comments
			$query = $db->query("SELECT content FROM " . COMMENT . " WHERE toid = " . $userid);
			$user->comments = array();
			while ($row = $query->fetch_object()) {
				$user->comments[] = $row->content;
			}
			// Fetch images
			$query = $db->query("SELECT mark.imageid AS imageid, x, y, name FROM " . MARK . " AS mark LEFT JOIN " . IMAGE . " AS images ON images.imageid = mark.imageid WHERE toid = " . $userid);
			$user->images = array();
			while ($row = $query->fetch_object()) {
				$user->images[] = $row;
			}
			// Fetch images without marks, we do not want to miss anybody
			$query = $db->query("SELECT imageid, name FROM " . IMAGE . " WHERE fromid = " . $userid);
			$user->markless = array();
			while ($row = $query->fetch_object()) {
				$user->markless[] = $row;
			}
			hJSON($user);
		} else {
			h404();
		}
	});
}
?>