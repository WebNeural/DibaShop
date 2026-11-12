<?php
require_once __DIR__ . '/../bootstrap.php';
only_method('POST');
require_login();

$input = get_json_input();
$items = $input['items'] ?? [];

if (!is_array($items) || count($items) === 0) {
   json_error("سبد خرید خالی است");
}

try {
    $pdo->beginTransaction();

    $orderItems = [];
    $total = 0;

    foreach ($items as $item) {
        $productId = (int)($item['product_id'] ?? 0);
        $quantity = max(1, (int)($item['quantity'] ?? 1));

        $stmt = $pdo->prepare('SELECT * FROM products WHERE id = ? FOR UPDATE');
        $stmt->execute([$productId]);
        $product = $stmt->fetch();

        if (!$product) {
            throw new Exception("یکی از محصولات سبد خرید دیگر موجود نیست.");
        }
        if ($product['stock'] < $quantity) {
            throw new Exception("موجودی «{$product['name']}» کافی نیست.");
        }

        $unitPrice = $product['discount_price'] ?: $product['price'];
        $total += $unitPrice * $quantity;

        $orderItems[] = [
            'product_id' => $product['id'],
            'name' => $product['name'],
            'image' => $product['image'],
            'quantity' => $quantity,
            'price' => $unitPrice
        ];

        $pdo->prepare('UPDATE products SET stock = stock - ?, sales_count = sales_count + ? WHERE id = ?')
            ->execute([$quantity, $quantity, $product['id']]);
    }

    $userId = current_user_id();
    $stmt = $pdo->prepare('INSERT INTO orders (user_id, total_price, status) VALUES (?, ?, "pending")');
    $stmt->execute([$userId, $total]);
    $orderId = $pdo->lastInsertId();

    $itemStmt = $pdo->prepare('INSERT INTO order_items (order_id, product_id, product_name, product_image, quantity, price) VALUES (?, ?, ?, ?, ?, ?)');
    foreach ($orderItems as $oi) {
        $itemStmt->execute([$orderId, $oi['product_id'], $oi['name'], $oi['image'], $oi['quantity'], $oi['price']]);
    }

    $pdo->commit();

    json_response(['success' => true, 'order_id' => $orderId, 'total_price' => $total]);

} catch (Exception $e) {
    $pdo->rollBack();
    json_error($e->getMessage());
}
