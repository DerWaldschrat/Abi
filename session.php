<?php
session_start();
define("SESSION_INIT", true);
function isLoggedin($required = 0) {
    return isset($_SESSION["user"]["loggedin"]) && $_SESSION["user"]["loggedin"] === true && $_SESSION["user"]["rights"] >= $required;
}
function userField($field) {
    return $_SESSION["user"][$field];
}
?>