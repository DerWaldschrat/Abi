<?php
// starts the session
session_start();
define("SESSION_INIT", true);
define("WRITEMODE", strtotime("01-04-2013") >= time());
// sets session initialization time if not set
if (!(isset($_SESSION["__init"]))) {
    $_SESSION["__init"] = time();
// checks if session is older than an hour, then change session id
} else {
    if ($_SESSION["__init"] < (time() - 3600) ) {
        session_regenerate_id();
        $_SESSION["__init"] = time();
    }
}

function isLoggedin($required = 0) {
    return isset($_SESSION["user"]["loggedin"]) && $_SESSION["user"]["loggedin"] === true && $_SESSION["user"]["rights"] >= $required;
}
function userField($field) {
    return $_SESSION["user"][$field];
}
function setUserField($field, $value) {
    $_SESSION["user"][$field] = $value;
}
?>