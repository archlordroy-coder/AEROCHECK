<?php
/**
 * AEROCHECK API Proxy
 * Ce fichier agit comme point d'entrée pour le frontend hébergé sur un autre serveur
 * Il transmet toutes les requêtes au backend Node.js sur le port 3300
 */

// Configuration
$BACKEND_URL = 'http://82.165.150.150:3300';
$FRONTEND_ORIGIN = '*'; // Modifier selon le domaine du frontend externe

// Activer CORS pour permettre au frontend externe d'accéder à l'API
header("Access-Control-Allow-Origin: $FRONTEND_ORIGIN");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Credentials: true");

// Répondre immédiatement aux requêtes OPTIONS (preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Construire l'URL du backend en retirant le nom du script (index.php) de l'URI
$request_uri = $_SERVER['REQUEST_URI'];
// Clean up path: remove everything before and including index.php
$api_path = preg_replace('/^.*?index\.php/', '', $request_uri);

// En cas d'URL réécrite sans index.php, on garde le chemin tel quel
if ($api_path === $request_uri && strpos($api_path, '/api') !== 0) {
    $api_path = $_SERVER['PATH_INFO'] ?? $api_path;
}

// S'assurer que le chemin commence par un slash et n'en a pas de double à la jointure
if (empty($api_path) || $api_path[0] !== '/') {
    $api_path = '/' . $api_path;
}
$api_path = preg_replace('#/+#', '/', $api_path);

$backend_url = $BACKEND_URL . $api_path;

// Si le chemin ne commence pas par /api, c'est probablement une route frontend
// On sert alors le fichier index.html pour permettre le routing React (SPA)
if (strpos($api_path, '/api') !== 0 && $api_path !== '/favicon.ico') {
    $index_file = __DIR__ . '/index.html';
    if (file_exists($index_file)) {
        readfile($index_file);
        exit;
    }
}

// Debug headers
header("X-Proxy-Target: $backend_url");
header("X-Proxy-Status: Forwarding");

// Récupérer la méthode HTTP
$method = $_SERVER['REQUEST_METHOD'];

// Récupérer les headers de la requête
$headers = getallheaders();
$forward_headers = [];

// Headers à transférer au backend
$forward_header_keys = [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Accept-Language',
    'Accept-Encoding'
];

foreach ($forward_header_keys as $key) {
    if (isset($headers[$key])) {
        $forward_headers[] = "$key: " . $headers[$key];
    } elseif ($key === 'Authorization' && isset($_SERVER['HTTP_AUTHORIZATION'])) {
        // Fallback pour Apache/PHP
        $forward_headers[] = "Authorization: " . $_SERVER['HTTP_AUTHORIZATION'];
    } elseif ($key === 'Authorization' && isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
        // Autre fallback possible
        $forward_headers[] = "Authorization: " . $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
    }
}

// Préparer les données du body
$body = null;
if ($method === 'POST' || $method === 'PUT' || $method === 'PATCH') {
    $body = file_get_contents('php://input');
}

// Initialiser cURL
$ch = curl_init();

// Configuration de la requête cURL
curl_setopt_array($ch, [
    CURLOPT_URL => $backend_url,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_FOLLOWLOCATION => true,
    CURLOPT_CUSTOMREQUEST => $method,
    CURLOPT_HTTPHEADER => $forward_headers,
    CURLOPT_SSL_VERIFYPEER => false,
    CURLOPT_SSL_VERIFYHOST => false,
]);

// Ajouter le body si présent
if ($body !== null) {
    curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
}

// Exécuter la requête
$response = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$content_type = curl_getinfo($ch, CURLINFO_CONTENT_TYPE);

// Vérifier les erreurs
if (curl_errno($ch)) {
    http_response_code(502);
    header('Content-Type: application/json');
    echo json_encode([
        'error' => 'Bad Gateway',
        'message' => 'Erreur de connexion au backend: ' . curl_error($ch)
    ]);
    curl_close($ch);
    exit;
}

curl_close($ch);

// Transférer le status code et content-type au client
http_response_code($http_code);
if ($content_type) {
    header("Content-Type: $content_type");
}

// Retourner la réponse du backend
echo $response;
