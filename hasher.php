<?php
function hashme($pass, $nick)
{
    return sha1($pass . $nick . "realLife");   
}




?>