<?php
require_once __DIR__ . '/../bootstrap.php';
only_method('GET');

$categoryId = $_GET['category_id'] ?? null;

if ($categoryId) {
    $stmt = $pdo->prepare('SELECT * FROM products WHERE category_id = ? ORDER BY id');
    $stmt->execute([(int)$categoryId]);
} else {
    $stmt = $pdo->query('SELECT * FROM products ORDER BY id');
}

$products = $stmt->fetchAll();
foreach ($products as &$p) {
    $p['id'] = (int)$p['id'];
    $p['category_id'] = $p['category_id'] !== null ? (int)$p['category_id'] : null;
    $p['price'] = (int)$p['price'];
    $p['discount_price'] = $p['discount_price'] !== null ? (int)$p['discount_price'] : null;
    $p['stock'] = (int)$p['stock'];
    $p['sales_count'] = (int)$p['sales_count'];
}

json_response(['success' => true, 'products' => $products]);
