import { basename } from 'path';
import fastify from 'fastify';
import puppeteer from 'puppeteer-core';

const { API_PORT = 5000, API_KEY, PUPPETEER_EXECUTABLE_PATH } = process.env;

const server = fastify({
  logger: true,
});

server.addHook('onRequest', function checkApiKey(request, reply, done) {
  if (!API_KEY?.length) {
    done();
    return;
  }

  try {
    const authHeader = request.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      throw new Error('The Authorization header is malformed');
    }

    const key = authHeader.substring(7, authHeader.length);

    if (key !== API_KEY) {
      throw new Error('The API key is invalid');
    }

    done();
  } catch (error) {
    reply
      .code(401)
      .header(
        'www-authenticate',
        `Bearer error="invalid_token", error_description="${error.message}"`,
      );
    done(error);
  }
});

server.post('/', async (request, reply) => {
  const { html = '', options = {} } = request.body;

  const browser = await puppeteer.launch({
    executablePath: PUPPETEER_EXECUTABLE_PATH,
  });

  try {
    const page = await browser.newPage();

    await page.setContent(html, { waitUntil: 'domcontentloaded' });

    await page.emulateMediaType('screen');

    const fileName = basename(options?.path || 'document.pdf');

    const pdf = await page.pdf({ ...options, path: '' });

    return reply
      .code(201)
      .header('Content-Type', 'application/pdf')
      .header('Content-Disposition', `attachment; filename=${fileName}`)
      .send(pdf);
  } finally {
    await browser.close();
  }
});

const start = async () => {
  try {
    await server.listen({ host: '0.0.0.0', port: API_PORT });
    if (API_KEY?.length) {
      server.log.info(`API key: ${API_KEY}`);
    }
  } catch (err) {
    server.log.error(err);
    throw err;
  }
};

const stop = async () => {
  await server.close();
};

process.on('SIGINT', () => {
  stop();
  process.exit(0);
});

process.on('SIGTERM', () => {
  stop();
  process.exit(0);
});

start();
