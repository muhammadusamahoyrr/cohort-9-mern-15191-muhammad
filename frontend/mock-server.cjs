const http = require('http');

let notes = [
  { id: 1, title: 'Standup notes', preview: 'Discussed the release schedule. Everything is on track for the Friday deployment.', isPinned: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 2, title: 'Groceries', preview: 'Coffee, olive oil, toilet paper, milk, and whole grain bread.', isPinned: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];

let nextId = 3;

const server = http.createServer((req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;

  console.log(`[Mock API] ${req.method} ${pathname}`);

  // Helpers
  const sendJSON = (status, data) => {
    res.writeHead(status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: status >= 200 && status < 300, data }));
  };

  const readBody = (callback) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        callback(body ? JSON.parse(body) : {});
      } catch (err) {
        sendJSON(400, { error: { message: 'Malformed JSON' } });
      }
    });
  };

  // Auth Endpoints
  if (pathname === '/api/auth/login' && req.method === 'POST') {
    sendJSON(200, {
      user: { id: 1, name: 'Ada Lovelace', email: 'ada@example.com', createdAt: new Date().toISOString() },
      token: 'fake-jwt-token-12345'
    });
    return;
  }

  if (pathname === '/api/auth/register' && req.method === 'POST') {
    readBody(body => {
      sendJSON(201, {
        user: { id: 1, name: body.name || 'Ada Lovelace', email: body.email, createdAt: new Date().toISOString() },
        token: 'fake-jwt-token-12345'
      });
    });
    return;
  }

  if (pathname === '/api/auth/me' && req.method === 'GET') {
    sendJSON(200, {
      user: { id: 1, name: 'Ada Lovelace', email: 'ada@example.com', createdAt: new Date().toISOString() }
    });
    return;
  }

  if (pathname === '/api/auth/logout' && req.method === 'POST') {
    sendJSON(200, { message: 'Logged out' });
    return;
  }

  // Notes Endpoints
  if (pathname === '/api/notes' && req.method === 'GET') {
    // Honour the search/sort params the API contract defines, so the UI can be
    // exercised against this fixture the way it will behave for real.
    const term = (url.searchParams.get('search') || '').trim().toLowerCase();
    const [sortKey, order] = [url.searchParams.get('sort'), url.searchParams.get('order')];
    let rows = notes;
    if (term) {
      rows = rows.filter(n =>
        (n.title || '').toLowerCase().includes(term) ||
        (n.contentHtml || n.preview || '').toLowerCase().includes(term)
      );
    }
    const field = { updated_at: 'updatedAt', created_at: 'createdAt', title: 'title' }[sortKey];
    if (field) {
      rows = rows.slice().sort((a, b) => {
        const cmp = field === 'title'
          ? String(a.title).localeCompare(String(b.title))
          : new Date(a[field]) - new Date(b[field]);
        return order === 'asc' ? cmp : -cmp;
      });
    }
    sendJSON(200, {
      notes: rows.map(n => ({
        id: n.id,
        title: n.title,
        preview: n.preview || (n.contentHtml || '').replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').substring(0, 160),
        isPinned: n.isPinned,
        color: n.color,
        createdAt: n.createdAt,
        updatedAt: n.updatedAt
      })),
      pagination: { page: 1, limit: 10, total: rows.length, totalPages: 1 }
    });
    return;
  }

  if (pathname === '/api/notes' && req.method === 'POST') {
    readBody(body => {
      const note = {
        id: nextId++,
        title: body.title,
        contentHtml: body.contentHtml || '',
        preview: (body.contentHtml || '').replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').substring(0, 160),
        isPinned: Boolean(body.isPinned),
        color: body.color,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      notes.push(note);
      sendJSON(201, { note });
    });
    return;
  }

  if (pathname.startsWith('/api/notes/') && req.method === 'GET') {
    const id = parseInt(pathname.split('/').pop(), 10);
    const note = notes.find(n => n.id === id);
    if (!note) {
      res.writeHead(404);
      res.end(JSON.stringify({ success: false, error: { message: 'Note not found' } }));
      return;
    }
    sendJSON(200, {
      note: {
        id: note.id,
        title: note.title,
        contentHtml: note.contentHtml || `<p>${note.preview}</p>`,
        isPinned: note.isPinned,
        color: note.color,
        createdAt: note.createdAt,
        updatedAt: note.updatedAt
      }
    });
    return;
  }

  if (pathname.startsWith('/api/notes/') && req.method === 'PUT') {
    const id = parseInt(pathname.split('/').pop(), 10);
    const noteIndex = notes.findIndex(n => n.id === id);
    if (noteIndex === -1) {
      res.writeHead(404);
      res.end(JSON.stringify({ success: false, error: { message: 'Note not found' } }));
      return;
    }
    readBody(body => {
      const updated = {
        ...notes[noteIndex],
        ...body,
        updatedAt: new Date().toISOString()
      };
      if (body.contentHtml) {
        updated.preview = body.contentHtml.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').substring(0, 160);
      }
      notes[noteIndex] = updated;
      sendJSON(200, { note: updated });
    });
    return;
  }

  if (pathname.startsWith('/api/notes/') && req.method === 'DELETE') {
    const id = parseInt(pathname.split('/').pop(), 10);
    notes = notes.filter(n => n.id !== id);
    res.writeHead(204);
    res.end();
    return;
  }

  // Not found
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ success: false, error: { message: 'Not Found' } }));
});

server.listen(4000, () => {
  console.log('Mock API server running on port 4000');
});
