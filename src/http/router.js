import { readFile } from "node:fs/promises";
import path from "node:path";
const PUBLIC_DIR = path.resolve("public");

async function serveStaticFile(req, res) {
  if (req.method !== "GET") {
    return false;
  }

  let pathname;

  try {
    pathname = decodeURIComponent(
      new URL(req.url, "http://localhost").pathname
    );
  } catch {
    res.writeHead(400, { "Content-Type": "application/json" });
    res.end(JSON.stringify({
      error: {
        code: "BAD_REQUEST",
        message: "Invalid URL"
      }
    }));
    return true;
  }

  if (pathname === "/") {
    pathname = "/index.html";
  }

  const filePath = path.resolve(PUBLIC_DIR, `.${pathname}`);
  const relativePath = path.relative(PUBLIC_DIR, filePath);

  if (
    relativePath.startsWith("..") ||
    path.isAbsolute(relativePath)
  ) {
    res.writeHead(403, { "Content-Type": "application/json" });
    res.end(JSON.stringify({
      error: {
        code: "FORBIDDEN",
        message: "Access denied"
      }
    }));
    return true;
  }

  try {
    const content = await readFile(filePath);

    const contentTypes = {
      ".html": "text/html",
      ".css": "text/css",
      ".js": "text/javascript",
      ".json": "application/json",
      ".png": "image/png",
      ".jpg": "image/jpeg",
      ".svg": "image/svg+xml"
    };

    const contentType =
      contentTypes[path.extname(filePath).toLowerCase()] ||
      "application/octet-stream";

    res.writeHead(200, {
      "Content-Type": contentType
    });

    res.end(content);
    return true;

  } catch (error) {
    if (error.code === "ENOENT" || error.code === "EISDIR") {
      return false;
    }

    throw error;
  }
}

const routes = [
  {
    method: "GET",
    path: "/health",
    handler: (req, res) => {
      res.writeHead(200, {
        "Content-Type": "application/json"
      });

      res.end(JSON.stringify({
        status: "ok"
      }));
    }
  }
];

export function matchPath(routePath, requestPath) {
  const routeParts = routePath.split("/").filter(Boolean);
  const requestParts = requestPath.split("?")[0].split("/").filter(Boolean);

  if (routeParts.length !== requestParts.length) {
    return null;
  }

   const params = {};

  for (let i = 0; i < routeParts.length; i++) {
    if (routeParts[i].startsWith(":")) {
      const paramName = routeParts[i].slice(1);
      params[paramName] = requestParts[i];
    } else if (routeParts[i] !== requestParts[i]) {
      return null;
    }
  }

  return params;
}

  
export async function router(req, res) {
  for (const route of routes) {
    if (route.method === req.method) {
    const params = matchPath(route.path, req.url);

    if (params !== null) {
      req.params = params;
      route.handler(req, res);
      return;
    }
  }
}

const served= await serveStaticFile(req, res);
if (served) {
  return;
} 
res.writeHead(404, {
  "Content-Type": "application/json"
});
res.end(JSON.stringify({
  error: {
    code: "NOT_FOUND",
    message: `Route ${req.method} ${req.url} not found`
    }
  }));
}
