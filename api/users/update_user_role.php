<?php
require_once __DIR__ . '/../bootstrap.php';
only_method('POST');
require_admin();

$input = get_json_input();
$id = (int)($input['id'] ?? 0);
$role = $input['role'] ?? '';

if (!$id || !in_array($role, ['user', 'admin'], true)) {
    json_error('اطلاعات ناقص است.');
}
if ($id === current_user_id() && $role !== 'admin') {
    json_error('نمی‌توانید نقش ادمین خودتان را بردارید.');
}

$stmt = $pdo->prepare('UPDATE users SET role = ? WHERE id = ?');
$stmt->execute([$role, $id]);

json_response(['success' => true]);
