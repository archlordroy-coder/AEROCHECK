<?php
/**
 * AEROCHECK Frontend - Point d'entrée PHP
 * Ce fichier sert le frontend React et injecte la configuration API
 * 
 * Configuration requise:
 * - Définir VITE_API_URL dans un fichier .env côté serveur web
 *   ou modifier la valeur par défaut ci-dessous
 */

// Configuration de l'API backend (via proxy index.php)
// Modifiez cette URL selon votre configuration
$apiUrl = getenv('VITE_API_URL') ?: 'http://82.165.150.150:3300/index.php';

// Headers de sécurité
header("X-Frame-Options: DENY");
header("X-Content-Type-Options: nosniff");
header("Referrer-Policy: strict-origin-when-cross-origin");

// Activer la compression si disponible
if (extension_loaded('zlib')) {
    ini_set('zlib.output_compression', 'On');
}

// Déterminer le fichier à servir
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$path = __DIR__ . '/dist' . $uri;

// Si c'est une requête API, rediriger vers le proxy backend
if (strpos($uri, '/api/') === 0) {
    // Redirection vers le proxy backend
    $backendUrl = $apiUrl . $uri;
    if (!empty($_SERVER['QUERY_STRING'])) {
        $backendUrl .= '?' . $_SERVER['QUERY_STRING'];
    }
    
    // Transférer la requête
    $ch = curl_init();
    curl_setopt_array($ch, [
        CURLOPT_URL => $backendUrl,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_CUSTOMREQUEST => $_SERVER['REQUEST_METHOD'],
        CURLOPT_HTTPHEADER => [
            'Content-Type: ' . ($_SERVER['CONTENT_TYPE'] ?? 'application/json'),
            'Authorization: ' . ($_SERVER['HTTP_AUTHORIZATION'] ?? ''),
        ],
    ]);
    
    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        curl_setopt($ch, CURLOPT_POSTFIELDS, file_get_contents('php://input'));
    }
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    http_response_code($httpCode);
    header('Content-Type: application/json');
    echo $response;
    exit;
}

// Servir les fichiers statiques s'ils existent
if ($uri !== '/' && file_exists($path)) {
    // Déterminer le content-type
    $ext = pathinfo($path, PATHINFO_EXTENSION);
    $mimeTypes = [
        'js' => 'application/javascript',
        'mjs' => 'application/javascript',
        'css' => 'text/css',
        'html' => 'text/html',
        'json' => 'application/json',
        'png' => 'image/png',
        'jpg' => 'image/jpeg',
        'jpeg' => 'image/jpeg',
        'gif' => 'image/gif',
        'svg' => 'image/svg+xml',
        'ico' => 'image/x-icon',
        'woff' => 'font/woff',
        'woff2' => 'font/woff2',
        'ttf' => 'font/ttf',
    ];
    
    if (isset($mimeTypes[$ext])) {
        header("Content-Type: {$mimeTypes[$ext]}");
    }
    
    // Cache pour les assets statiques
    if ($ext !== 'html') {
        header("Cache-Control: public, max-age=31536000, immutable");
    }
    
    readfile($path);
    exit;
}

// Sinon, servir l'index.html (SPA)
$indexPath = __DIR__ . '/dist/index.html';
if (!file_exists($indexPath)) {
    http_response_code(500);
    echo "Erreur: Le build du frontend n'a pas été trouvé. Lancez 'npm run build' d'abord.";
    exit;
}

// Lire le contenu et injecter la configuration
$content = file_get_contents($indexPath);

// Injecter la configuration API dans une balise script
$configScript = "<script>window.VITE_API_URL = " . json_encode($apiUrl) . ";</script>";
$content = str_replace('<head>', "<head>\n    $configScript", $content);

// Headers pour le HTML
header("Content-Type: text/html; charset=UTF-8");
header("Cache-Control: no-cache, no-store, must-revalidate");
header("Pragma: no-cache");
header("Expires: 0");

echo $content;
