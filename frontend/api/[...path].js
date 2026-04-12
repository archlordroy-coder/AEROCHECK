// API Proxy pour Vercel - Redirige toutes les requêtes vers le backend Node.js directement
export default async function handler(req, res) {
  // Le backend est maintenant en Node.js, on ne passe plus par index.php
  const backendUrl = 'http://82.165.150.150:3300';
  
  // Extraire le chemin de l'API (ex: /api/auth/login)
  const apiPath = req.query.path ? req.query.path.join('/') : '';
  const queryString = req.url.includes('?') ? '?' + req.url.split('?')[1] : '';
  const targetUrl = `${backendUrl}/api/${apiPath}${queryString}`;

  // Headers CORS de base
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS,PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const fetchOptions = {
      method: req.method,
      headers: {
        'Authorization': req.headers['authorization'] || '',
      },
    };

    // Forward content-type only if present
    if (req.headers['content-type']) {
      fetchOptions.headers['Content-Type'] = req.headers['content-type'];
    }

    // Forward body for non-GET requests
    if (req.method !== 'GET' && req.method !== 'HEAD' && req.body) {
      fetchOptions.body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    }

    console.log(`[Proxy] Forwarding ${req.method} ${req.url} -> ${targetUrl}`);
    
    const response = await fetch(targetUrl, fetchOptions);
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      res.status(response.status).json(data);
    } else {
      const data = await response.text();
      res.status(response.status).send(data);
    }
  } catch (error) {
    console.error('[Proxy Error]', error);
    res.status(500).json({ error: 'Proxy error', message: error.message });
  }
}
