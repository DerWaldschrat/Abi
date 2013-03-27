<?php
defined("__EXEC") or exit;
// Fetches all Categories
function fetchCategoriesAll($table = CATEGORY) {
    $result = db()->query("SELECT categoryid, title FROM ". $table);
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