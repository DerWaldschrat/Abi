<?php
// Hier kommt eigentlich die Überprüfung herein, wer welche Galerie anschauen kann
define("__EXEC", true);
define("IN", "../");
define("PHP_EX", ".php");
require IN . "coreconfig" . PHP_EX;
if (isLoggedin(1) && userField("galeria") === 1) {
    header("Content-type: application/json");
    readfile("protected/x.json");

}
?>