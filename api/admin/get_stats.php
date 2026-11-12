<?php
require_once __DIR__ . '/../bootstrap.php';
only_method('GET');
require_admin();

$stats = [
    'products_count' => (int)$pdo->query('SELECT COUNT(*) c FROM products')->fetch()['c'],
    'users_count' => (int)$pdo->query('SELECT COUNT(*) c FROM users')->fetch()['c'],
    'orders_count' => (int)$pdo->query('SELECT COUNT(*) c FROM orders')->fetch()['c'],
    'pending_orders_count' => (int)$pdo->query("SELECT COUNT(*) c FROM orders WHERE status='pending'")->fetch()['c'],
    'revenue' => (int)$pdo->query("SELECT COALESCE(SUM(total_price),0) s FROM orders WHERE status='completed'")->fetch()['s'],
];

json_response(['success' => true, 'stats' => $stats]);
