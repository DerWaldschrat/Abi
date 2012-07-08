<?php
function randomString($length = 8)
{
    $signs = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    $result = "";
    for ($i = 0; $i < $length; $i++) {
        $result .= substr(str_shuffle($signs), 0, 1);        
    }
    return $result;   
}



?>