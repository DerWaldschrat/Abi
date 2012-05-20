<?php
/**
 * Created by JetBrains PhpStorm.
 * User: hauke
 * Date: 27.02.12
 * Time: 17:59
 */
defined("__EXEC") or exit;
/**
 * @param $user Pointer to a User object on which
 */
function fetchUserData(&$user)
{
    $st = db()->prepare("SELECT geburtstag, strasse, wohnort, danksagung, positiv, negativ, zukunft FROM " .USER_DATA . " WHERE userid = ?");
    $st->bind_param("i", $user->userid);
    $st->bind_result( $user->geburtstag, $user->strasse, $user->wohnort, $user->danksagung, $user->positiv, $user->negativ, $user->zukunft);
    $st->execute();
    $st->fetch();
    $user->geburtstag = dateChangeFromISO($user->geburtstag);
    $st->close();
}
?>