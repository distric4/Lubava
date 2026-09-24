<?php
/**
 * Приём заявок с форм записи (консультация / обучение).
 * Принимает JSON POST от script.js (см. FORM_ENDPOINT), отправляет письмо
 * владельцу сайта напрямую с сервера — без участия почты посетителя.
 */

header('Content-Type: application/json; charset=utf-8');

// Разрешаем обращаться как с основного домена, так и с резервной копии на GitHub Pages.
$allowed_origins = [
    'https://lyubava-knyazeva.ru',
    'https://www.lyubava-knyazeva.ru',
    'https://distric4.github.io',
];
$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';
if (in_array($origin, $allowed_origins, true)) {
    header('Access-Control-Allow-Origin: ' . $origin);
    header('Vary: Origin');
}
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'method_not_allowed']);
    exit;
}

$raw = file_get_contents('php://input');
$data = json_decode($raw, true);
if (!is_array($data)) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'bad_request']);
    exit;
}

function field($data, $key, $max = 2000) {
    $v = isset($data[$key]) ? (string) $data[$key] : '';
    $v = trim($v);
    $v = str_replace(["\r", "\n"], ' ', $v); // защита от инъекции заголовков писем
    return mb_substr($v, 0, $max);
}

$type    = field($data, 'type', 20);
$name    = field($data, 'name', 200);
$phone   = field($data, 'phone', 50);
$email   = field($data, 'email', 200);
$service = field($data, 'service', 300);
$format  = field($data, 'format', 50);
$message = trim((string) (isset($data['message']) ? $data['message'] : ''));
$message = mb_substr($message, 0, 3000);
$page    = field($data, 'page', 200);

if ($name === '' || $phone === '') {
    http_response_code(422);
    echo json_encode(['ok' => false, 'error' => 'missing_fields']);
    exit;
}

$to = 'klln@mail.ru';
$is_training = ($type === 'Обучение');
$subject = $is_training ? 'Новая заявка на обучение' : 'Новая заявка на консультацию';

$lines = [];
$lines[] = 'Имя: ' . $name;
$lines[] = 'Телефон: ' . $phone;
if ($email !== '') {
    $lines[] = 'Email: ' . $email;
}
if ($format !== '') {
    $lines[] = 'Формат: ' . $format;
}
$lines[] = ($is_training ? 'Программа: ' : 'Услуга: ') . ($service !== '' ? $service : 'не выбрана');
if ($message !== '') {
    $lines[] = 'Сообщение: ' . $message;
}
$lines[] = '';
$lines[] = 'Страница: ' . ($page !== '' ? $page : '—');
$lines[] = 'Отправлено с сайта lyubava-knyazeva.ru, ' . date('d.m.Y H:i');

$body = implode("\n", $lines);

$from_address = 'noreply@lyubava-knyazeva.ru';
$headers = [];
$headers[] = 'From: Заявки с сайта <' . $from_address . '>';
if ($email !== '' && filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $headers[] = 'Reply-To: ' . $email;
}
$headers[] = 'Content-Type: text/plain; charset=UTF-8';
$headers[] = 'Content-Transfer-Encoding: 8bit';

$encoded_subject = '=?UTF-8?B?' . base64_encode($subject) . '?=';

$sent = mail($to, $encoded_subject, $body, implode("\r\n", $headers));

if ($sent) {
    echo json_encode(['ok' => true]);
} else {
    http_response_code(502);
    echo json_encode(['ok' => false, 'error' => 'send_failed']);
}
