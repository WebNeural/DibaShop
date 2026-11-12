<?php
require_once __DIR__ . '/../bootstrap.php';
only_method('POST');

$_SESSION = [];
session_destroy();

json_response(['success' => true]);
