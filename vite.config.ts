import { defineConfig, Plugin, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

const devApi = (): Plugin => ({
  name: 'dev-api-gemini',
  apply: 'serve',
  configureServer(server) {
    server.middlewares.use('/api/chat', async (req: any, res: any) => {
      if (req.method !== 'POST') {
        res.statusCode = 405;
        res.end('Method Not Allowed');
        return;
      }

      // Load environment variables from .env files
      const env = loadEnv('development', process.cwd(), '');
      const key = env.GEMINI_API_KEY || process?.env?.GEMINI_API_KEY;
      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Transfer-Encoding', 'chunked');

      try {
        let body = '';
        await new Promise<void>((resolve) => {
          req.on('data', (c: any) => (body += c));
          req.on('end', () => resolve());
        });
        const { messages = [], model = 'gemini-2.0-flash', temperature = 0.7 } = JSON.parse(body || '{}');

        if (!key) {
          res.write("error: {\"code\":\"MISSING_KEY\",\"message\":\"Set GEMINI_API_KEY in your shell to enable dev API.\"}\n");
          res.end();
          return;
        }

        const prompt = messages.map((m: any) => `${m.role}: ${m.content}`).join('\n\n');
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
        const upstream = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': key,
          },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [{ text: prompt }],
              },
            ],
            generationConfig: { temperature },
          }),
        });

        if (!upstream.ok) {
          const errTxt = await upstream.text();
          res.write(`error: {\"code\":\"UPSTREAM_ERROR\",\"status\":${upstream.status},\"message\":${JSON.stringify(errTxt)} }\n`);
          res.end();
          return;
        }

        const data: any = await upstream.json();
        const text: string = (data?.candidates?.[0]?.content?.parts || [])
          .map((p: any) => p.text || '')
          .join('');

        for (let i = 0; i < text.length; i++) {
          res.write(text[i]);
          await new Promise((r) => setTimeout(r, 5));
        }
        res.end();
      } catch (e: any) {
        res.write(`error: {\"code\":\"SERVER_ERROR\",\"message\":${JSON.stringify(e?.message || String(e))}}\n`);
        res.end();
      }
    });
  },
});

export default defineConfig({
  plugins: [react(), devApi()],
  server: {
    host: true,          // or '0.0.0.0' to listen on all interfaces
    port: 5173,
    strictPort: true,
  },
  preview: {
    host: true,          // also expose `vite preview` over LAN
    port: 5173,
    strictPort: true,
  },
});
