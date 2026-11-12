<?php
require_once __DIR__ . '/../bootstrap.php';
only_method('POST');
require_admin();

$input = get_json_input();
$id = (int)($input['id'] ?? 0);
if (!$id) json_error('شناسه نامعتبر است.');

try {
    $stmt = $pdo->prepare('DELETE FROM categories WHERE id = ?');
    $stmt->execute([$id]);
    json_response(['success' => true]);
} catch (PDOException $e) {
    json_error('خطا در حذف دسته‌بندی.');
}
