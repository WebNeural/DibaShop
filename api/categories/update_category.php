<?php
require_once __DIR__ . '/../bootstrap.php';
only_method('POST');
require_admin();

$input = get_json_input();
$id = (int)($input['id'] ?? 0);
$name = trim($input['name'] ?? '');
if (!$id || !$name) json_error('اطلاعات ناقص است.');

$stmt = $pdo->prepare('UPDATE categories SET name = ? WHERE id = ?');
$stmt->execute([$name, $id]);

json_response(['success' => true]);
