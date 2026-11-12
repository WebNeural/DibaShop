<?php
require_once __DIR__ . '/../bootstrap.php';
only_method('GET');
require_login();

$id = (int)($_GET['id'] ?? 0);
if (!$id) json_error('شناسه سفارش نامعتبر است.');

$stmt = $pdo->prepare('SELECT * FROM orders WHERE id = ?');
$stmt->execute([$id]);
$order = $stmt->fetch();

if (!$order) json_error('سفارش یافت نشد.', 404);

if ($order['user_id'] != current_user_id() && ($_SESSION['role'] ?? '') !== 'admin') {
    json_error('شما اجازه‌ی مشاهده‌ی این سفارش را ندارید.', 403);
}

$itemsStmt = $pdo->prepare('SELECT product_id, product_name AS name, product_image AS image, quantity, price FROM order_items WHERE order_id = ?');
$itemsStmt->execute([$id]);
$order['items'] = $itemsStmt->fetchAll();

json_response(['success' => true, 'order' => $order]);
