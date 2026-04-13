import test from "node:test";
import assert from "node:assert";
import { spawn } from "node:child_process";

const startServer = (env: Record<string, string>) => {
  return new Promise<{ process: import("node:child_process").ChildProcess, baseUrl: string }>((resolve, reject) => {
    const cp = spawn("node", ["src/index.ts"], {
      env: { ...process.env, ...env },
      stdio: "pipe"
    });

    let started = false;

    cp.stdout?.on("data", (data) => {
      const output = data.toString();
      const match = output.match(/Server listening at (http:\/\/[^\s"]+)/);
      if (match && !started) {
        started = true;
        const address = match[1].replace("0.0.0.0", "127.0.0.1");
        resolve({ process: cp, baseUrl: address });
      }
    });

    cp.stderr?.on("data", (data) => {
      // Capturing stderr in case of fastify logs
    });

    cp.on("error", (err) => {
      if (!started) reject(err);
    });

    cp.on("exit", (code) => {
      if (!started) {
        reject(new Error(`Server exited with code ${code}`));
      }
    });
  });
};

test("Server handles default env vars", async () => {
  const { process: serverProcess, baseUrl } = await startServer({});
  try {
    const healthRes = await fetch(`${baseUrl}/healthz`);
    assert.strictEqual(healthRes.status, 200, "Health endpoint should return 200");

    const indexRes = await fetch(`${baseUrl}/`);
    assert.strictEqual(indexRes.status, 200, "Index endpoint should return 200");
    
    const indexBody = await indexRes.text();
    assert.ok(indexBody.includes("Graph Explorer"), "Index should contain 'Graph Explorer'");
  } finally {
    serverProcess.kill("SIGKILL");
  }
});

test("Server handled custom port", async () => {
  const { process: serverProcess, baseUrl } = await startServer({ PORT: "3080" });
  try {
    const url = new URL(baseUrl);
    assert.strictEqual(url.port, "3080", "Server should listen on the custom port");
    
    const healthRes = await fetch(`${baseUrl}/healthz`);
    assert.strictEqual(healthRes.status, 200, "Health endpoint should return 200");

    const indexRes = await fetch(`${baseUrl}/`);
    assert.strictEqual(indexRes.status, 200, "Index endpoint should return 200");
    
    const indexBody = await indexRes.text();
    assert.ok(indexBody.includes("Graph Explorer"), "Index should contain 'Graph Explorer'");
  } finally {
    serverProcess.kill("SIGKILL");
  }
});

test("Server handles custom base path", async () => {
  const { process: serverProcess, baseUrl } = await startServer({ BASE_PATH: "/sub-path/" });
  try {
    const healthRes = await fetch(`${baseUrl}/sub-path/healthz`);
    assert.strictEqual(healthRes.status, 200, "Health endpoint on sub path should return 200");
    
    const indexRes = await fetch(`${baseUrl}/sub-path/`);
    assert.strictEqual(indexRes.status, 200, "Index endpoint on sub path should return 200");
    
    const indexBody = await indexRes.text();
    assert.ok(indexBody.includes("Graph Explorer"), "Index should contain 'Graph Explorer'");
  } finally {
    serverProcess.kill("SIGKILL");
  }
});
