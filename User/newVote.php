<?php
define("__EXEC", true);
define("IN", "../");
define("PHP_EX", ".php");

require IN . "coreconfig" . PHP_EX;
require IN . "mapper" . PHP_EX;
require IN . "validator" . PHP_EX;
if(isLoggedin(2)) {
    post(function () {
        $body = bodyAsJSON();
        if (isset($body->new_vote) && is_numeric($body->new_vote) && userField("new_vote") == 0) {
            setUserField("new_vote", $body->new_vote);
        } else {
            h404();
        }
    });
}
?>