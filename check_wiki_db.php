<?php
$mysqli = new mysqli("localhost", "root", "", "alphadocere_wiki");
$result = $mysqli->query("SHOW TABLES");
$tables = [];
while ($row = $result->fetch_row()) {
    $tables[] = $row[0];
}
echo json_encode($tables);
