<?php
require_once __DIR__ . '/../bootstrap.php';
only_method('POST');
require_admin();
 
$input = get_json_input();
$id = (int)($input['id'] ?? 0);
$name = trim($input['name'] ?? '');
$category_id = !empty($input['category_id']) ? (int)$input['category_id'] : null;
$price = (int)($input['price'] ?? 0);
$discount_price = !empty($input['discount_price']) ? (int)$input['discount_price'] : null;
$stock = (int)($input['stock'] ?? 0);
$image = trim($input['image'] ?? '') ?: 'placeholder.jpg';
$description = trim($input['description'] ?? '');
 
if (!$id || !$name || $price <= 0) json_error('اطلاعات ناقص است.');
 
$stmt = $pdo->prepare('SELECT image FROM products WHERE id = ?');
$stmt->execute([$id]);
$oldProduct = $stmt->fetch();
 
$stmt = $pdo->prepare('UPDATE products SET category_id=?, name=?, price=?, discount_price=?, stock=?, image=?, description=? WHERE id=?');
$stmt->execute([$category_id, $name, $price, $discount_price, $stock, $image, $description, $id]);
 
if ($oldProduct && $oldProduct['image'] && $oldProduct['image'] !== $image && $oldProduct['image'] !== 'placeholder.jpg') {
    $oldImagePath = __DIR__ . '/../../assets/images/' . $oldProduct['image'];
    if (file_exists($oldImagePath)) {
        @unlink($oldImagePath);
    }
}
 
json_response(['success' => true]);