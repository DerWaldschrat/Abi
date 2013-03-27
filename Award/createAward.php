<?php
defined("__EXEC") or die;
// Create a new award for this category and user
/**
 * @param $category
 * @param $user
 * @return int The inserted id or -1 if it failed
 */
function createAward($category, $user, $table = AWARD)
{
    $st = db()->prepare("INSERT INTO " . $table . " (categoryid, userid) VALUES (?, ?)");
    $st->bind_param("ii", $category, $user);
    if (exQuery($st)) {
        return $st->insert_id;
    } else {
        return -1;
    }
}

// Sets award defaults settings
function awardDefaults(&$award) {
    if (!property_exists($award, "femaleid")) {
        $award->femaleid = null;
    }
    if (!property_exists($award, "maleid")) {
        $award->maleid = null;
    }
}