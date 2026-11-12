<?php
require_once __DIR__ . '/../bootstrap.php';
only_method('POST');

$input = get_json_input();
$email = strtolower(trim($input['email'] ?? ''));
$password = $input['password'] ?? '';

if (!$email || !$password) {
    json_error('لطفاً ایمیل و رمز عبور را وارد کنید.');
}

$stmt = $pdo->prepare('SELECT id, full_name, email, password, role FROM users WHERE email = ?');
$stmt->execute([$email]);
$user = $stmt->fetch();

if (!$user || !password_verify($password, $user['password'])) {
    json_error('ایمیل یا رمز عبور اشتباه است.', 401);
}

session_regenerate_id(true);
$_SESSION['user_id'] = $user['id'];
$_SESSION['role'] = $user['role'];

unset($user['password']);
json_response(['success' => true, 'user' => $user]);
