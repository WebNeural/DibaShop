<?php
require_once __DIR__ . '/../bootstrap.php';
only_method('POST');
require_admin();

$input = get_json_input();
$name = trim($input['name'] ?? '');
if (!$name) json_error('نام دسته‌بندی الزامی است.');

$stmt = $pdo->prepare('INSERT INTO categories (name) VALUES (?)');
$stmt->execute([$name]);

json_response(['success' => true, 'category' => ['id' => $pdo->lastInsertId(), 'name' => $name]]);
