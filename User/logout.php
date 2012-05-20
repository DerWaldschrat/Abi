<?php
/**
 * Created by JetBrains PhpStorm.
 * User: hauke
 * Date: 27.02.12
 * Time: 18:08
 * To change this template use File | Settings | File Templates.
 */
define("__EXEC", true);
define("IN", "../");
define("PHP_EX", ".php");
require IN . "coreconfig" . PHP_EX;

unset($_SESSION["user"]);
header("Location: " . getUrlToPath(""));
?>