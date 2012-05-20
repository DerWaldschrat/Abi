<?php
defined("__EXEC") or die;


// Checks if all values of the object exist: EMPTY-check
function hasAllSet($obj, array $keys) {
    foreach ($keys as $key) {
        if (empty($obj->{$key})) return false;
    }
    return true;        
}
// Checks if all values of the object exist: !ISSET-check
function hasAllSetIsset($obj, array $keys) {
    foreach ($keys as $key) {
        if (!isset($obj->{$key})) return false;
    }
    return true;
}

// Checks for a valid email-address
function isEmail($value)
{
    // TODO
    return preg_match("/^[a-zA-Z0-9-_]+(\.[a-zA-Z0-9-_]*)*@([a-zA-Z0-9-_]+\.)+[a-zA-Z]{2,4}$/", $value) != 0;    
}
// Checks for a valid link
function isLink($value)
{
    // TODO
    return true;    
}
// Checks for a valid length
function hasRightLength($value, $min, $max = -1) {
    $len = strlen($value);
    return ($min === -1 || $len >= $min) && ($max === -1 || $len <= $max);    
}


?>