<?php
define("__EXEC", true);
define("IN", "../");
define("PHP_EX", ".php");
require IN . "coreconfig" . PHP_EX;
require IN . "mapper" . PHP_EX;
require IN . "validator" . PHP_EX;
if (isLoggedin(1)) {
    // Creating new lessons
    post(function () {
        $lesson = bodyAsJSON();
        if (hasAllSet($lesson, array("kuerzel", "lehrer", "fach", "stunden")) && is_array($lesson->stunden)) {
            $valid = true;
            foreach($lesson->stunden as $stunde) {
                if (!is_int($stunde)) {
                    $valid = false;
                    break;
                }
            }
            if ($valid === true) {
                $db = db();
                $st = $db->prepare("INSERT INTO " . KURS . " (kuerzel, lehrer, fach, stunden, fromid) VALUES (?, ?, ?, ?, ?)");
                echo $db->error;
                $_userid = userField("userid");
                $stunden = json_encode($lesson->stunden);
                $st->bind_param("sssss", $lesson->kuerzel, $lesson->lehrer, $lesson->fach, $stunden, $_userid);
                if (exQuery($st)) {
                    hJSON(array("kursid" => $db->insert_id));
                } else {
                    fail("lessonSaveFail");
                }
            } else {
                fail("lessonSaveFail");
            }
        } else {
            fail("lessonSaveFail");
        }
    });
    get(function () {
        $db = db();
        $query = $db->query("SELECT kursid, kuerzel, lehrer, fach, stunden FROM " .KURS);
        if ($query instanceof mysqli_result) {
            $results = array();
            while ($row = $query->fetch_object()) {
                $row->stunden = json_decode($row->stunden);
                $results[] = $row;
            }
            hJSON($results);
        }
    });
} else {
    h404();
}

?>