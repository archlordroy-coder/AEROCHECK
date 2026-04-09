<?php
/**
 * AEROCHECK API Proxy
 * Redirige toutes les requêtes /api/* vers le backend
 */

// Configuration du backend
$backendUrl = 'http://82.165.150.150:3300/index.php';

// Récupérer le chemin de l'API
$requestUri = $_SERVER['REQUEST_URI'];
$path = str_replace('/api/', '', parse_url($requestUri, PHP_URL_PATH));
$query = parse_url($requestUri, PHP_URL_QUERY) ?: '';

// Construire l'URL cible
$targetUrl = $backendUrl . '/api/' . $path;
if ($query) {
    $targetUrl .= '?' . $query;
}

// Headers CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Credentials: true");

// Gérer les requêtes OPTIONS (pre-flight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Transférer la requête au backend
$ch = curl_init($targetUrl);

// Configurer curl
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $_SERVER['REQUEST_METHOD']);

// Headers à transférer
$headers = [
    'Content-Type: ' . ($_SERVER['CONTENT_TYPE'] ?? 'application/json'),
];

// Authorization header
if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
    $headers[] = 'Authorization: ' . $_SERVER['HTTP_AUTHORIZATION'];
}

curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

// Body pour POST/PUT/PATCH
if (in_array($_SERVER['REQUEST_METHOD'], ['POST', 'PUT', 'PATCH'])) {
    $input = file_get_contents('php://input');
    if ($input) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, $input);
    }
}

// Exécuter la requête
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$contentType = curl_getinfo($ch, CURLINFO_CONTENT_TYPE);

if (curl_errno($ch)) {
    http_response_code(500);
    echo json_encode(['error' => 'Proxy error', 'message' => curl_error($ch)]);
    curl_close($ch);
    exit;
}

curl_close($ch);

// Retourner la réponse
http_response_code($httpCode);
if ($contentType) {
    header("Content-Type: " . $contentType);
} else {
    header("Content-Type: application/json");
}

echo $response;
