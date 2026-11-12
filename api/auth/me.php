<?php
require_once __DIR__ . '/../bootstrap.php';
only_method('GET');

$userId = current_user_id();
if (!$userId) {
    json_response(['success' => true, 'user' => null]);
}

$stmt = $pdo->prepare('SELECT id, full_name, email, role FROM users WHERE id = ?');
$stmt->execute([$userId]);
$user = $stmt->fetch();

if (!$user) {
    $_SESSION = [];
    session_destroy();
    json_response(['success' => true, 'user' => null]);
}

json_response(['success' => true, 'user' => $user]);
