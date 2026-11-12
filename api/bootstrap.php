<?php

session_start();
header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/../config/db.php';

function json_response($data, $code = 200) {
    http_response_code($code);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

function json_error($message, $code = 400) {
    json_response(['success' => false, 'message' => $message], $code);
}

function get_json_input() {
    $data = json_decode(file_get_contents('php://input'), true);
    return is_array($data) ? $data : [];
}

function current_user_id() {
    return $_SESSION['user_id'] ?? null;
}

function require_login() {
    if (!current_user_id()) {
        json_error('برای این کار ابتدا باید وارد شوید.', 401);
    }
}

function require_admin() {
    require_login();
    if (($_SESSION['role'] ?? '') !== 'admin') {
        json_error('شما اجازه‌ی دسترسی به این بخش را ندارید.', 403);
    }
}

function only_method($method) {
    if ($_SERVER['REQUEST_METHOD'] !== $method) {
        json_error('متد درخواست نامعتبر است.', 405);
    }
}
