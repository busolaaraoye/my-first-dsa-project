import test from "node:test";
import assert from "node:assert/strict";
import { matchPath } from "../src/http/router.js";
import { app } from "../src/http/app.js";

test("matchPath captures a route parameter", () => {
  const result = matchPath("/events/:id", "/events/250");

  assert.deepEqual(result, { id: "250" });
});

test("invalid JSON returns 400 BAD_JSON", async () => {
  app.listen(0);

  const port = app.address().port;

  const response = await fetch(`http://localhost:${port}/health`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: '{"name":'
  });

  const result = await response.json();

  assert.equal(response.status, 400);
  assert.equal(result.error.code, "BAD_JSON");

  await new Promise((resolve) => app.close(resolve));
});

test("static server blocks access to files outside public", async () => {
  app.listen(0);

  const port = app.address().port;

  try {
    const response = await fetch(
      `http://localhost:${port}/%2e%2e%2fpackage.json`
    );

    const result = await response.json();

    assert.equal(response.status, 403);
    assert.equal(result.error.code, "FORBIDDEN");
  } finally {
    await new Promise((resolve) => app.close(resolve));
  }
});

test("GET /health returns 200 and server status ok", async () => {
  app.listen(0);

  const port = app.address().port;

  try {
    const response = await fetch(`http://localhost:${port}/health`);
    const result = await response.json();

    assert.equal(response.status, 200);
    assert.deepEqual(result, { status: "ok" });
  } finally {
    await new Promise((resolve) => app.close(resolve));
  }
});

test("GET / serves the Eventry homepage", async () => {
  app.listen(0);

  const port = app.address().port;

  try {
    const response = await fetch(`http://localhost:${port}/`);
    const result = await response.text();

    assert.equal(response.status, 200);
    assert.match(result, /Welcome to Eventry!/);
  } finally {
    await new Promise((resolve) => app.close(resolve));
  }
});