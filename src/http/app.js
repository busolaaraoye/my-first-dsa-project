import http from "node:http";
import { router } from "./router.js";

async function handleRequest(req, res) {
  try {
    const chunks = [];

    for await (const chunk of req) {
      chunks.push(chunk);
    }

    const body = Buffer.concat(chunks).toString();

    try {
      req.body = body ? JSON.parse(body) : {};
    } catch {
      res.writeHead(400, {
        "Content-Type": "application/json"
      });

      res.end(JSON.stringify({
        error: {
          code: "BAD_JSON",
          message: "Request body contains invalid JSON"
        }
      }));

      return;
    }

    await router(req, res);

  } catch (error) {
    console.error(error);

    if (res.headersSent) {
      res.destroy();
      return;
    }

    res.writeHead(500, {
      "Content-Type": "application/json"
    });

    res.end(JSON.stringify({
      error: {
        code: "INTERNAL_ERROR",
        message: "An unexpected server error occurred"
      }
    }));
  }
}
export const app = http.createServer(handleRequest);