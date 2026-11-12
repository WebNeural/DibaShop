<?php
require_once __DIR__ . '/../bootstrap.php';
only_method('GET');

$categories = $pdo->query('SELECT id, name FROM categories ORDER BY id')->fetchAll();
json_response(['success' => true, 'categories' => $categories]);
