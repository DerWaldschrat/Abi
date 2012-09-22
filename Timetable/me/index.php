<?php
/**
 * Created by JetBrains PhpStorm.
 * User: hauke
 * Date: 15.09.12
 * Time: 13:35
 * To change this template use File | Settings | File Templates.
 */
define("__EXEC", true);
define("IN", "../../");
define("PHP_EX", ".php");
require IN . "coreconfig" . PHP_EX;
require IN . "mapper" . PHP_EX;
if (isLoggedin(1)) {
    $file = "./__tables/" . userField("userid") . ".json";

    put(function () {
        global $file;
        $body = bodyAsJSON();
        if (count($body) === 60 && strlen(body()) <= 2048) {
            file_put_contents($file, body());

        } else {
            fail("timetableSaveFail");
        }
    });
    get(function () {
        global $file;
        if (!file_exists($file)) {
            $arr = array_fill(0, 60, -1);
            $json = json_encode($arr);
            file_put_contents($file, $json);
            hJSON();
            echo $json;
        } else {
            hJSON();
            readfile($file);
        }
    });
}
?>
