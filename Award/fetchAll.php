<?php
defined("__EXEC") or exit;
// Fetches all Categories
function fetchCategoriesAll() {
    $result = db()->query("SELECT categoryid, title FROM ". CATEGORY);
    if ($result instanceof mysqli_result) {
        $rows = array();
        while($r = $result->fetch_object()) {
            $rows[$r->categoryid] = $r;
        }
        return $rows;
    } else {
        return array();
    }
}