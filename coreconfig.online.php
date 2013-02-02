<?php
/**
 * This config file prepares everything for DEVELOPMENT.
 * You should change this in a productive area to the coreconfig.production.php, make sure you rename it after deleting this file!
 * */
defined("__EXEC") or die;
// Start a session
if (!defined("SESSION_INIT")) {
    require IN . "session" . PHP_EX;
}
error_reporting(0);
// do not call the mail function directly, because we cant be sure to use it on localhost
$mail = "mail";
// We do need to encrypt on Linux/Unix
$crypt = "crypt";

/**
 * Create Url to path, needs configuration
 * */
function getUrlToPath($path)
{
    return "%%ROOT%%" . $path;
}



/**
 * Get connection to the database
 * */
$__DB = null;
function db() 
{
    global $__DB;
    if($__DB === null) {
        $__DB = new mysqli("localhost", "%%DB_USER%%", "%%DB_PASS%%", "%%DB_NAME%%");
        $__DB->set_charset("utf8");
    }
    return $__DB;        
}

$pre = "abi_";
define("USER", $pre . "user");
define("USER_DATA", $pre . "user_data");
define("QUOTE", $pre . "quote");
define("COMMENT", $pre . "comment");
define("AWARD", $pre . "award");
define("CATEGORY", $pre . "category");
define("KURS", $pre . "kurs");
define("TERM", $pre . "term");
define("IMAGE", $pre . "images");
define("MARK", $pre . "images_mark");
define("DATA", $pre . "data");


/**
 * Executes a query and tells if it was successful.
 * */
function exQuery($query, $affected = 0) {
    return $query->execute() && $query->affected_rows > $affected;
}
/**
 * Shorthand for header("HTTP/1.1 404 Not Found");
 * */
function h404($json = null)
{
    header("HTTP/1.1 404 Not Found");
    if ($json !== null) {
        header("Content-Type: application/json");
        echo json_encode($json);
    }       
}

/**
 * Fails with a little message
 * */
function fail ($message = null) {
    if ($message !== null && !is_array($message)) {
        $message = array("message" => $message);
    }
    h404($message);
    exit;
}

function hJSON($json = null)
{
    header("Content-Type: application/json");
    if ($json !== null) {
        echo json_encode($json);
    }
}

function dateChangeFromISO($date) {
    if (strlen($date) !== 10) return "00.00.0000";
    $date = explode("-", $date);
    return $date[2].".".$date[1].".".$date[0];
}

function dateChangeToISO($date) {
    if(strlen($date) !== 10) return "0000-00-00";
    $date = explode(".", $date);
    return $date[2].".".$date[1].".".$date[0];
}



?>