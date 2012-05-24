<?php
defined("__EXEC") or exit;

// Get the data of the uploaded file
function uploadedFile() {
    return $_FILES["file"];    
}

// Get the data as json when a file is uploaded
function uploadedAsJSON($array = false) {
    static $__UPLOADEDASJSON = null;
    if ($__UPLOADEDASJSON === null) {
        $__UPLOADEDASJSON = json_decode($_POST["model"], $array);
    }
    return $__UPLOADEDASJSON;       
}

// Get the real HTTP-Method cause for PUT we cannot use the other one
function realMethod() {
    return $_POST["method"];
}

function createNewFilename($name, $path)
{
  $orname = $name;
  $i = 1;
  while (file_exists($path . $name)) {
    $name = $i . "_" . $orname;
    $i++;
  }
  return $name;
}



// ä
?>