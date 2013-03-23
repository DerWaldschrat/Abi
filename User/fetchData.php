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
    $st = db()->prepare("SELECT geburtstag, strasse, wohnort, danksagung, positiv, negativ, zukunft, semi_thema, p_semi, w_semi, abi_schriftlich, abi_muendlich_1, abi_muendlich_2, german, math, publish_ok, publish_problems FROM " .USER_DATA . " WHERE userid = ?");
    $st->bind_param("i", $user->userid);
    $st->bind_result( $user->geburtstag, $user->strasse, $user->wohnort, $user->danksagung, $user->positiv, $user->negativ, $user->zukunft, $user->semi_thema, $user->p_semi, $user->w_semi, $user->abi_schriftlich, $user->abi_muendlich_1, $user->abi_muendlich_2, $user->german, $user->math, $user->publish_ok, $user->publish_problems);
    $st->execute();
    $st->fetch();
    $user->geburtstag = dateChangeFromISO($user->geburtstag);
    $st->close();
}
?>