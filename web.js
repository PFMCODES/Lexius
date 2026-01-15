const http = require("http");
const fs = require("fs");
const path = require("path");

const mimeTypes = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "text/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
};

const server = http.createServer((req, res) => {
  let filePath =
    req.url === "/"
      ? "./index.html"
      : `./${req.url}`;

  const ext = path.extname(filePath);
  const contentType = mimeTypes[ext] || "text/plain";

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("404 Not Foun ");
      return;
    }

    res.writeHead(200, { "Content-Type": contentType });
    res.end(content);
  });
})
server.listen(0, () => {
  const port = server.address().port;
  console.log(`Server running on http://localhost:${port}`);
});
