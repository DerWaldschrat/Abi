<?php
define("__EXEC", true);
define("IN", "./");
define("PHP_EX", ".php");

require IN . "coreconfig" . PHP_EX;

$query = $_SERVER["QUERY_STRING"];
if (preg_match("/^[a-z0-9]{96,96}$/", $query) == 0) {
    h404();
} else {
    $file = "__registered/" . $query . ".json";
    if (!file_exists($file)) {
        h404();
    } else {
        $user = json_decode(file_get_contents($file));
        require IN . "validator" . PHP_EX;
        if (!hasAllSet($user, array("nickname", "vorname", "nachname", "passwort", "email", "userid", "geschlecht"))) {
            h404();
        } else {
            // Jetzt können wir den User eintragen
            $db = db();
            require IN . "random.php";
            $cat = randomString(12);
            $query = $db->prepare("UPDATE " . USER . " SET nickname = ?, vorname = ?, nachname = ?, passwort = ?, email = ?, geschlecht = ?, cat = ? WHERE userid = ?");
            $query->bind_param("sssssssi", $user->nickname, $user->vorname, $user->nachname, $user->passwort, $user->email, $user->geschlecht, $cat, $user->userid);
            if (exQuery($query)) {
                unlink($file);
                header("Location: ".getUrlToPath("succeedRegister.html#" . $user->nickname));
            } else {
                header("Location: ".getUrlToPath("failRegister.html#" . $user->nickname));
            } 
        }  
    }
}




?>