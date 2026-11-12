<?php
require_once __DIR__ . '/../bootstrap.php';
only_method('POST');
require_admin();

$input = get_json_input();
$id = (int)($input['id'] ?? 0);
$status = $input['status'] ?? '';

if (!$id || !in_array($status, ['pending', 'completed', 'cancelled'], true)) {
    json_error('اطلاعات ناقص است.');
}

$stmt = $pdo->prepare('UPDATE orders SET status = ? WHERE id = ?');
$stmt->execute([$status, $id]);

json_response(['success' => true]);
