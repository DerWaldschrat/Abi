<?php
define("__EXEC", true);
define("IN", "../");
define("PHP_EX", ".php");
require IN . "coreconfig" . PHP_EX;
require IN . "mapper" . PHP_EX;
get(function () {
    $field = !empty($_GET["field"]) ? $_GET["field"] : "";
    $val = !empty($_GET["val"]) ? $_GET["val"] : "";
    if ($field === "" || $val === "") {
    } else {
        $allowedFields = array("nickname" => "nickname", "email" => "email");
        $field = !empty($allowedFields[$field]) ? $allowedFields[$field] : "";
        if ($field === "") {
        } else {
            $db = db();
            $st = $db->prepare("SELECT userid FROM " . USER . " WHERE " . $field . " = ?");
            $st->bind_param("s", $val);
            $st->execute();
            $st->store_result();
            if ($st->num_rows === 0) {
                h404();   
            }
        }
    }
                
});




?>