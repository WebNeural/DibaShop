<?php
require_once __DIR__ . '/../bootstrap.php';
only_method('POST');

$input = get_json_input();
$full_name = trim($input['full_name'] ?? '');
$email = strtolower(trim($input['email'] ?? ''));
$password = $input['password'] ?? '';

if (!$full_name || !$email || !$password) {
    json_error('لطفاً همه فیلدها را پر کنید.');
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    json_error('ایمیل معتبر نیست.');
}
if (strlen($password) < 6) {
    json_error('رمز عبور باید حداقل ۶ کاراکتر باشد.');
}

$stmt = $pdo->prepare('SELECT id FROM users WHERE email = ?');
$stmt->execute([$email]);
if ($stmt->fetch()) {
    json_error('این ایمیل قبلاً ثبت شده است.');
}

$hashed = password_hash($password, PASSWORD_DEFAULT);

$stmt = $pdo->prepare('INSERT INTO users (full_name, email, password, role) VALUES (?, ?, ?, ?)');
$stmt->execute([$full_name, $email, $hashed, 'user']);
$userId = $pdo->lastInsertId();

$_SESSION['user_id'] = $userId;
$_SESSION['role'] = 'user';

json_response([
    'success' => true,
    'user' => ['id' => $userId, 'full_name' => $full_name, 'email' => $email, 'role' => 'user']
]);
