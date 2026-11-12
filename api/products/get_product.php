<?php
require_once __DIR__ . '/../bootstrap.php';
only_method('GET');

$id = (int)($_GET['id'] ?? 0);
if (!$id) json_error('شناسه محصول نامعتبر است.');

$stmt = $pdo->prepare('SELECT p.*, c.name AS category_name FROM products p LEFT JOIN categories c ON c.id = p.category_id WHERE p.id = ?');
$stmt->execute([$id]);
$product = $stmt->fetch();

if (!$product) json_error('محصول یافت نشد.', 404);

json_response(['success' => true, 'product' => $product]);
