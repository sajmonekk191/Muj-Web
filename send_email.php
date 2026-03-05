<?php
declare(strict_types=1);

/**
 * Contact Form Email Handler
 * snovak.cz — Šimon Novák
 */

// ─── Security headers ────────────────────────────────────────────────────────
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('Referrer-Policy: strict-origin-when-cross-origin');

// ─── CORS (restrict to your own origin in production) ────────────────────────
$allowed_origin = 'https://snovak.cz';
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

if ($origin === $allowed_origin || str_ends_with($origin, '.snovak.cz')) {
    header("Access-Control-Allow-Origin: {$origin}");
} else {
    // Allow during local dev (no origin header) — remove in strict production
    header('Access-Control-Allow-Origin: *');
}

header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Requested-With');

// ─── Preflight ────────────────────────────────────────────────────────────────
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// ─── Only accept POST ────────────────────────────────────────────────────────
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Metoda není povolena.']);
    exit;
}

// ─── Rate-limit (basic, session-based) ───────────────────────────────────────
session_start();
$now = time();
$window = 60;   // seconds
$max_requests = 3;

$_SESSION['contact_log'] = array_filter(
    $_SESSION['contact_log'] ?? [],
    fn(int $t) => $t > $now - $window
);

if (count($_SESSION['contact_log']) >= $max_requests) {
    http_response_code(429);
    echo json_encode(['success' => false, 'message' => 'Příliš mnoho požadavků. Zkuste to za chvíli.']);
    exit;
}

$_SESSION['contact_log'][] = $now;

// ─── Input sanitization & validation ─────────────────────────────────────────
function sanitize(string $value): string
{
    return trim(htmlspecialchars(strip_tags($value), ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8'));
}

$name        = sanitize($_POST['name']        ?? '');
$email       = sanitize($_POST['email']       ?? '');
$phoneNumber = sanitize($_POST['phoneNumber'] ?? '');
$message     = sanitize($_POST['message']     ?? '');

$errors = [];

if ($name === '' || mb_strlen($name) < 2) {
    $errors[] = 'Jméno musí mít alespoň 2 znaky.';
}
if ($name !== '' && mb_strlen($name) > 100) {
    $errors[] = 'Jméno je příliš dlouhé.';
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors[] = 'Neplatná emailová adresa.';
}
if ($message === '' || mb_strlen($message) < 10) {
    $errors[] = 'Zpráva musí mít alespoň 10 znaků.';
}
if (mb_strlen($message) > 5000) {
    $errors[] = 'Zpráva je příliš dlouhá (max 5000 znaků).';
}
if ($phoneNumber !== '' && !preg_match('/^\+?[\d\s\-().]{6,20}$/', $phoneNumber)) {
    $errors[] = 'Neplatné telefonní číslo.';
}

if (!empty($errors)) {
    http_response_code(422);
    echo json_encode(['success' => false, 'message' => implode(' ', $errors)]);
    exit;
}

// ─── PHPMailer ────────────────────────────────────────────────────────────────
require_once __DIR__ . '/vendor/autoload.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

$mail = new PHPMailer(true);

try {
    // Server
    $mail->isSMTP();
    $mail->Host       = 'wes1-smtp.wedos.net';
    $mail->SMTPAuth   = true;
    $mail->Username   = 'sn@snovak.cz';
    $mail->Password   = '!Karel25911';
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port       = 587;
    $mail->CharSet    = 'UTF-8';
    $mail->Timeout    = 10;

    // Recipients
    $mail->setFrom('sn@snovak.cz', 'snovak.cz — Kontaktní formulář');
    $mail->addAddress('sn@snovak.cz', 'Šimon Novák');
    $mail->addReplyTo($email, $name);

    // Content
    $mail->isHTML(true);
    $mail->Subject = "Nová zpráva od {$name} — snovak.cz";
    $mail->Body    = buildEmailHtml($name, $email, $phoneNumber, $message);
    $mail->AltBody = buildEmailText($name, $email, $phoneNumber, $message);

    $mail->send();

    http_response_code(200);
    echo json_encode(['success' => true, 'message' => 'Zpráva byla úspěšně odeslána!']);

} catch (Exception $e) {
    error_log('[snovak.cz] Mailer Error: ' . $mail->ErrorInfo);
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Zprávu se nepodařilo odeslat. Zkuste to prosím znovu.']);
}

// ─── Email templates ──────────────────────────────────────────────────────────
function buildEmailHtml(string $name, string $email, string $phone, string $message): string
{
    $msgFormatted = nl2br($message);
    $phone = $phone !== '' ? $phone : '—';
    $date = date('d.m.Y H:i');

    return <<<HTML
    <!DOCTYPE html>
    <html lang="cs">
    <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
    <body style="margin:0;padding:0;background:#030712;font-family:Inter,Helvetica,Arial,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#030712;padding:40px 20px;">
        <tr><td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="background:#0f0a1a;border-radius:16px;border:1px solid rgba(168,85,247,0.3);overflow:hidden;max-width:600px;width:100%;">
            <tr>
              <td style="background:linear-gradient(135deg,#7c3aed,#06b6d4);padding:32px;text-align:center;">
                <h1 style="margin:0;color:#fff;font-size:22px;font-weight:800;letter-spacing:-0.02em;">Nová zpráva z webu</h1>
                <p style="margin:6px 0 0;color:rgba(255,255,255,0.7);font-size:13px;">snovak.cz — Kontaktní formulář</p>
              </td>
            </tr>
            <tr>
              <td style="padding:36px 32px;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding-bottom:20px;border-bottom:1px solid rgba(255,255,255,0.06);">
                      <p style="margin:0 0 4px;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:#64748b;font-weight:600;">Jméno</p>
                      <p style="margin:0;color:#f1f5f9;font-size:15px;font-weight:600;">{$name}</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:20px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
                      <p style="margin:0 0 4px;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:#64748b;font-weight:600;">Email</p>
                      <a href="mailto:{$email}" style="color:#a855f7;text-decoration:none;font-size:15px;">{$email}</a>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:20px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
                      <p style="margin:0 0 4px;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:#64748b;font-weight:600;">Telefon</p>
                      <p style="margin:0;color:#f1f5f9;font-size:15px;">{$phone}</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:20px 0;">
                      <p style="margin:0 0 10px;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:#64748b;font-weight:600;">Zpráva</p>
                      <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:10px;padding:16px;color:#94a3b8;font-size:14px;line-height:1.7;">{$msgFormatted}</div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 32px;border-top:1px solid rgba(255,255,255,0.06);text-align:center;">
                <p style="margin:0;font-size:12px;color:#475569;">Odesláno {$date} · <a href="https://snovak.cz" style="color:#a855f7;text-decoration:none;">snovak.cz</a></p>
              </td>
            </tr>
          </table>
        </td></tr>
      </table>
    </body>
    </html>
    HTML;
}

function buildEmailText(string $name, string $email, string $phone, string $message): string
{
    $phone = $phone !== '' ? $phone : '—';
    $date = date('d.m.Y H:i');
    return "Nová zpráva z snovak.cz\n\nJméno: {$name}\nEmail: {$email}\nTelefon: {$phone}\n\nZpráva:\n{$message}\n\n---\nOdesláno: {$date}";
}
