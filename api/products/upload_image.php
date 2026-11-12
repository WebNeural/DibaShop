<?php


require_once __DIR__ . '/../bootstrap.php';
only_method('POST');
require_admin();

if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
    json_error('فایلی برای آپلود دریافت نشد.');
}

$file = $_FILES['image'];

if ($file['size'] > 5 * 1024 * 1024) {
    json_error('حجم فایل نباید بیشتر از ۵ مگابایت باشد.');
}


$allowedTypes = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp', 'image/gif' => 'gif'];
$finfo = finfo_open(FILEINFO_MIME_TYPE);
$mimeType = finfo_file($finfo, $file['tmp_name']);
finfo_close($finfo);

if (!isset($allowedTypes[$mimeType])) {
    json_error('فقط فایل‌های تصویری (jpg, png, webp, gif) مجاز هستند.');
}

$extension = $allowedTypes[$mimeType];
$filename = 'product_' . uniqid() . '_' . time() . '.' . $extension;

$uploadDir = __DIR__ . '/../../assets/images/';
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

$destination = $uploadDir . $filename;

if (!move_uploaded_file($file['tmp_name'], $destination)) {
    json_error('خطا در ذخیره‌ی فایل روی سرور.');
}

json_response(['success' => true, 'filename' => $filename]);
