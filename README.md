# treibholzhq/html2pdf

Provides a REST endpoint to create PDF documents from an HTML string using Puppeteer.

Available at [DockerHub](https://hub.docker.com/r/treibholzhq/html2pdf).

## Usage

**Note:** This image needs to run in `privileged` mode, otherwise Puppeteer won't be able to launch the browser instance.

```sh
docker run --rm -it \
  --privileged \
  -p 5000:5000 \
  treibholzhq/html2pdf
```

### API key

The API can be secured with an API key using the `API_KEY` environment variable.
If you do that, you need to send a bearer token with each request (see [Examples](#basic-usage-with-api-key))

```sh
docker run --rm -it \
  --privileged \
  -p 5000:5000 \
  -e API_KEY=mysecretkey
  treibholzhq/html2pdf
```

The API is exposed on port `5000` inside the container.

Once the container is running, you can send an HTTP POST request with a JSON body of the following structure:

```json
{
  "html": "<h1>Hello, World!</h1>",
  "options": {
    ...
  }
}
```

The `options` object resembles the Puppeteer [`PDFOptions`](https://pptr.dev/api/puppeteer.pdfoptions/) interface.

## Examples

### Basic usage

```sh
curl http://localhost:5000/ -o out.pdf \
  --json '{"html": "<h1>Hello, World!</h1>"}'
```

### Basic usage with API key

```sh
curl http://localhost:5000/ -o out.pdf \
  -H 'Authorization: Bearer mysecretkey' \
  --json '{"html": "<h1>Hello, World!</h1>"}'
```

### Filename via path option

```sh
curl http://localhost:5000/ -O -J \
  --json '{"html": "<h1>Hello, World!</h1>", "options": { "path": "xyz.pdf" }}'
```

In this example, the target filename will be taken from the `Content-Disposition` response header.

### PDF options

```sh
curl http://localhost:5000/ -o out.pdf \
  --json '{"html": "<h1>Hello, World!</h1>", "options": { "format": "A4", "landscape": true }}'
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
