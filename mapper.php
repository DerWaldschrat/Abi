<?php
defined("__EXEC") or die;
$__METHOD = strtolower($_SERVER["REQUEST_METHOD"]);
$__BODY = null;
$__BODYASJSON = null;
function body() {
    global $__BODY, $__METHOD;
    if($__BODY === null) {
        $__BODY = file_get_contents("php://input");
    }
    return $__BODY;  
}

function bodyAsJSON($assoc = false) {
    global $__BODYASJSON;
    if ($__BODYASJSON === null) {
        $__BODYASJSON = json_decode(body(), $assoc);
    }
    return $__BODYASJSON;    
}

function get($file) {
    global $__METHOD;
    if($__METHOD === "get") {
        if (is_callable($file)) {
            $file();
        } else {
            require $file;
        }
    }
}

function post($file, $inReadMode = false) {
    global $__METHOD;
    if ($__METHOD === "post") {
        if (WRITEMODE === true || $inReadMode === true) {    
            if (is_callable($file)) {
                $file();
            } else {
                require $file;
            }
        } else {
            fail("inReadMode");
        }
    }
}

function put($file) {
    global $__METHOD;
    if ($__METHOD === "put") {
        if (WRITEMODE === true) {
            if (is_callable($file)) {
                $file();
            } else {
                require $file;
            }
        } else {
            fail("inReadMode");
        }
    }
}

function delete($file) {
    global $__METHOD;
    if ($__METHOD === "delete") {
        if (WRITEMODE === true) {
            if (is_callable($file)) {
                $file();
            } else {
                require $file;
            }
        } else {
            fail("inReadMode");
        }
    }
}

?>