<?php
/**
 * Estrae commenti WordPress per articoli pubblicati
 * Output JSON: { "id_articolo": [ { "autore": "...", "data": "...", "testo": "..." } ] }
 */

header('Content-Type: application/json; charset=utf-8');

// --------- AUTH (chiave) ---------
$expected_key = 'd9a0d82j5j438FJSLEORMVN389210';
if (!isset($_GET['key']) || $_GET['key'] !== $expected_key) {
  http_response_code(403);
  echo json_encode(['error' => 'Accesso non autorizzato'], JSON_UNESCAPED_UNICODE);
  exit;
}

// --------- CARICA WP CONFIG ---------
$wp_config_paths = [
  __DIR__ . '/../wp-config.php',
  __DIR__ . '/../../wp-config.php',
  __DIR__ . '/wp-config.php',
];

$wp_loaded = false;
foreach ($wp_config_paths as $p) {
  if (file_exists($p)) {
    require_once($p);
    $wp_loaded = true;
    break;
  }
}

if (!$wp_loaded) {
  http_response_code(500);
  echo json_encode(['error' => 'Impossibile trovare wp-config.php'], JSON_UNESCAPED_UNICODE);
  exit;
}

if (!defined('DB_HOST') || !defined('DB_USER') || !defined('DB_PASSWORD') || !defined('DB_NAME') || !isset($table_prefix)) {
  http_response_code(500);
  echo json_encode(['error' => 'Variabili DB non trovate in wp-config.php'], JSON_UNESCAPED_UNICODE);
  exit;
}

$host = DB_HOST;
$user = DB_USER;
$password = DB_PASSWORD;
$database = DB_NAME;
$prefix = $table_prefix;

// --------- DB ---------
$mysqli = new mysqli($host, $user, $password, $database);
$mysqli->set_charset('utf8mb4');

if ($mysqli->connect_error) {
  http_response_code(500);
  echo json_encode(['error' => 'Errore connessione DB', 'detail' => $mysqli->connect_error], JSON_UNESCAPED_UNICODE);
  exit;
}

// --------- QUERY COMMENTI ---------
// Estrae commenti approvati per articoli pubblicati
$sql = "
SELECT
  c.comment_post_ID AS post_id,
  c.comment_author AS autore,
  c.comment_date AS data,
  c.comment_content AS testo
FROM {$prefix}comments c
INNER JOIN {$prefix}posts p ON c.comment_post_ID = p.ID
WHERE c.comment_approved = '1'
  AND p.post_type = 'post'
  AND p.post_status = 'publish'
ORDER BY c.comment_post_ID ASC, c.comment_date ASC
";

$result = $mysqli->query($sql);

if (!$result) {
  http_response_code(500);
  echo json_encode(['error' => 'Errore query', 'detail' => $mysqli->error], JSON_UNESCAPED_UNICODE);
  $mysqli->close();
  exit;
}

// Raggruppa commenti per articolo
$commenti_per_articolo = [];

while ($row = $result->fetch_assoc()) {
  $post_id = intval($row['post_id']);
  
  if (!isset($commenti_per_articolo[$post_id])) {
    $commenti_per_articolo[$post_id] = [];
  }
  
  $commenti_per_articolo[$post_id][] = [
    'autore' => $row['autore'],
    'data' => $row['data'],
    'testo' => $row['testo']
  ];
}

$mysqli->close();

// Output JSON
echo json_encode($commenti_per_articolo, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);

