<?php
require_once __DIR__ . '/../bootstrap.php';
only_method('POST');
require_admin();

$input = get_json_input();
$id = (int)($input['id'] ?? 0);
if (!$id) json_error('شناسه نامعتبر است.');

if ($id === current_user_id()) {
    json_error('نمی‌توانید حساب کاربری خودتان را حذف کنید.');
}

$stmt = $pdo->prepare('DELETE FROM users WHERE id = ?');
$stmt->execute([$id]);

json_response(['success' => true]);
