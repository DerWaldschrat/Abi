<?php
define("__EXEC", true);
define("IN", "../");
define("PHP_EX", ".php");

require IN . "coreconfig" . PHP_EX;
require IN . "mapper" . PHP_EX;
if (isLoggedin(1)) {
    define("FILE_LIMIT", 10);
    post(function () {
        if (!empty($_FILES)) {
            require IN . "random" . PHP_EX;
            $userid = userField("userid");
            // First check amount of allowed files
            $sql = "SELECT COUNT(fromid) as counter FROM " . IMAGE . " WHERE fromid = " . $userid;
            $db = db();
            $result = $db->query($sql)->fetch_object();
            if ($result->counter >= FILE_LIMIT) {
                fail("maxFilesReached");
                return;
            } else {
                $allowed = FILE_LIMIT - $result->counter;
            }
            // PHP has a strange $_FILES array when in multiple mode
            // Therefor we have to change the indices
            $files = array();
            foreach ($_FILES["image"] as $property => $arr) {
                foreach($arr as $index => $value) {
                    if (!array_key_exists($index, $files)) {
                        $files[$index] = array();
                    }
                    $files[$index][$property] = $value;
                }
            }
            
            // Handle allowed amount of files
            $i = 0;
            $json = array();
            $path = IN . "__images/orig/";
            $st = $db->prepare("INSERT INTO " . IMAGE . " (name, origname, fromid) VALUES(?, ? ," . $userid . ")");
            echo $db->error;
            foreach($files as $file) {
                $tmp = $file["tmp_name"];
                $size = $file["size"];
                // We do not need empty files!
                if ($size == 0) {
                    continue;
                }
                $info = getimagesize($tmp);
                if ($info[2] !== IMAGETYPE_JPEG && $info[2] !== IMAGETYPE_PNG) {
                    continue;
                }
                $i++;
                $name = $file["name"];
                // Create new filename from randomString
                $newName = randomString(100) . md5(microtime()) . image_type_to_extension($info[2]);
                // move uploaded file
                if (move_uploaded_file($tmp, $path . $newName)) {
                    // Insert into database
                    $st->bind_param("ss", $newName, $name);
                    if (exQuery($st)) {
                        $json[] = array("name" => $newName, "origname" => $name, "imageid" => $db->insert_id);
                    }
                }
                // When limit is reached, stop inserting files
                if ($i == $allowed) {
                    break;
                }            
            }
            //echo json_encode(array("files" => $files, "count" => $allowed, "response" => $json));
            hJSON($json);
        } else {
            fail("noFilesSpecified");
        }
    });
    
    get(function () {
        $db = db();
        $userid = userField("userid");
        $sql = "SELECT imageid, name, origname FROM " . IMAGE . " WHERE fromid = " . $userid;
        $result = $db->query($sql);
        $images = array();
        while ($row = $result->fetch_object()) {
            $images[] = $row;
        }
        
        $sql = "SELECT markid, imageid, x, y, toid FROM " . MARK . " WHERE fromid = " . $userid;
        $result = $db->query($sql);
        $marks = array();
        while($row = $result->fetch_object()) {
            $marks[] = $row;
        }
        hJSON(array("images" => $images, "marks" => $marks));
    });
}
?>