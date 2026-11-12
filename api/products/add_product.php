<?php
require_once __DIR__ . '/../bootstrap.php';
only_method('POST');
require_admin();

$input = get_json_input();
$name = trim($input['name'] ?? '');
$category_id = !empty($input['category_id']) ? (int)$input['category_id'] : null;
$price = (int)($input['price'] ?? 0);
$discount_price = !empty($input['discount_price']) ? (int)$input['discount_price'] : null;
$stock = (int)($input['stock'] ?? 0);
$image = trim($input['image'] ?? '') ?: 'placeholder.jpg';
$description = trim($input['description'] ?? '');

if (!$name || $price <= 0) json_error('نام و قیمت محصول الزامی است.');

$stmt = $pdo->prepare('INSERT INTO products (category_id, name, price, discount_price, stock, image, description) VALUES (?, ?, ?, ?, ?, ?, ?)');
$stmt->execute([$category_id, $name, $price, $discount_price, $stock, $image, $description]);

json_response(['success' => true, 'id' => $pdo->lastInsertId()]);
