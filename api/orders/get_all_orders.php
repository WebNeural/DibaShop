<?php
require_once __DIR__ . '/../bootstrap.php';
only_method('GET');
require_admin();

$sql = 'SELECT o.id, o.total_price, o.status, o.created_at, u.full_name, u.email
        FROM orders o JOIN users u ON u.id = o.user_id
        ORDER BY o.created_at DESC';

json_response(['success' => true, 'orders' => $pdo->query($sql)->fetchAll()]);
