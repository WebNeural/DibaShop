<?php
require_once __DIR__ . '/../bootstrap.php';
only_method('POST');
require_admin();
 
$input = get_json_input();
$id = (int)($input['id'] ?? 0);
if (!$id) json_error('شناسه نامعتبر است.');
 
$stmt = $pdo->prepare('SELECT image FROM products WHERE id = ?');
$stmt->execute([$id]);
$product = $stmt->fetch();
 
$pdo->prepare('DELETE FROM products WHERE id = ?')->execute([$id]);
 
if ($product && $product['image'] && $product['image'] !== 'placeholder.jpg') {
    $imagePath = __DIR__ . '/../../assets/images/' . $product['image'];
    if (file_exists($imagePath)) {
        @unlink($imagePath);
    }
}
 
json_response(['success' => true]);