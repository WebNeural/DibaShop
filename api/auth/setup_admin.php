<?php

// http://localhost/diba-shop/api/auth/setup_admin.php
//
// ایمیل: admin@diba-shop.ir | رمز: "admin123"


require_once __DIR__ . '/../../config/db.php';
header('Content-Type: application/json; charset=utf-8');

$lockFile = __DIR__ . '/.setup_admin.lock';
if (file_exists($lockFile)) {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'این اسکریپت قبلاً اجرا شده و غیرفعال است.'], JSON_UNESCAPED_UNICODE);
    exit;
}

$email = 'admin@diba-shop.ir';
$password = 'admin123';
$hashed = password_hash($password, PASSWORD_DEFAULT);

$stmt = $pdo->prepare('SELECT id FROM users WHERE email = ?');
$stmt->execute([$email]);

if ($stmt->fetch()) {
    $pdo->prepare('UPDATE users SET password = ?, role = "admin" WHERE email = ?')->execute([$hashed, $email]);
} else {
    $pdo->prepare('INSERT INTO users (full_name, email, password, role) VALUES (?, ?, ?, "admin")')
        ->execute(['مدیر سایت', $email, $hashed]);
}

file_put_contents($lockFile, 'locked at ' . date('Y-m-d H:i:s'));

echo json_encode([
    'success' => true,
    'message' => 'کاربر ادمین ساخته شد. ایمیل: admin@diba-shop.ir | رمز: admin123 — این صفحه دیگر قابل اجرا نیست.'
], JSON_UNESCAPED_UNICODE);
