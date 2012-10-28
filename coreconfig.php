<?php
/**
 * This config file prepares everything for PRODUCTION.
 * */
defined("__EXEC") or die;
// Start a session
if (!defined("SESSION_INIT")) {
    require IN . "session" . PHP_EX;
}
error_reporting(E_ALL | E_STRICT);
// do not call the mail function directly, because we cant be sure to use it on localhost
$mail = "mail_hooking";
$crypt = "noob";
function noob ($val) {
    return $val;
}
require IN . "developer/mailhook" . PHP_EX;


/**
 * Create Url to path, needs configuration
 * */
function getUrlToPath($path)
{
    return "http://localhost/abi/" . $path;
}



/**
 * Get connection to the database
 * */

//Only for testing purposes
class mysqltest extends mysqli {
    public function __construct() {
        parent::__construct("127.0.0.1", "root", "", "abi");
    }

    /*public function prepare($query) {
        $this->_log($query);
        return parent::prepare($query);
    }

    public function query($query, $resultmode = MYSQLI_STORE_RESULT ) {
        $this->_log($query);
        return parent::query($query, $resultmode);
    }

    private function _log($query) {
        file_put_contents(__DIR__ . "/__queries.sql", $query . "\n", FILE_APPEND);
    } */
}
$__DB = null;
function db() 
{
    global $__DB;
    if($__DB === null) {
        $__DB = new mysqltest();
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
define("KURS", $pre ."kurs");
define("TERM", $pre . "term");
define("IMAGE", $pre . "images");
define("MARK", $pre . "images_mark");

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