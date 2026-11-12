<?php
require_once __DIR__ . '/../bootstrap.php';
only_method('GET');
require_login();

$stmt = $pdo->prepare('SELECT id, total_price, status, created_at FROM orders WHERE user_id = ? ORDER BY created_at DESC');
$stmt->execute([current_user_id()]);

json_response(['success' => true, 'orders' => $stmt->fetchAll()]);
