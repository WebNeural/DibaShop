<?php
require_once __DIR__ . '/../bootstrap.php';
only_method('GET');
require_admin();

$users = $pdo->query('SELECT id, full_name, email, role, created_at FROM users ORDER BY id DESC')->fetchAll();
json_response(['success' => true, 'users' => $users]);
