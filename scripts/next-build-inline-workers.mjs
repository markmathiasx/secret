import path from "node:path";
import process from "node:process";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

function parseArgs(argv) {
  const flags = {
    dir: process.cwd(),
    debug: false,
    debugPrerender: false,
    runLint: true,
    noMangling: false,
    appDirOnly: false,
    experimentalBuildMode: undefined,
    traceUploadUrl: undefined,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (!arg.startsWith("-")) {
      flags.dir = path.resolve(arg);
      continue;
    }

    if (arg === "--debug" || arg === "-d") {
      flags.debug = true;
      continue;
    }
    if (arg === "--debug-prerender") {
      flags.debugPrerender = true;
      continue;
    }
    if (arg === "--no-lint") {
      flags.runLint = false;
      continue;
    }
    if (arg === "--no-mangling") {
      flags.noMangling = true;
      continue;
    }
    if (arg === "--experimental-app-only") {
      flags.appDirOnly = true;
      continue;
    }
    if (arg === "--experimental-build-mode" && argv[index + 1]) {
      flags.experimentalBuildMode = argv[index + 1];
      index += 1;
      continue;
    }
    if (arg.startsWith("--experimental-build-mode=")) {
      flags.experimentalBuildMode = arg.split("=", 2)[1];
      continue;
    }
    if ((arg === "--experimental-upload-trace" || arg === "--experimental-upload-trace,") && argv[index + 1]) {
      flags.traceUploadUrl = argv[index + 1];
      index += 1;
      continue;
    }
  }

  return flags;
}

class InlineWorker {
  constructor(workerPath, options = {}) {
    this.workerPath = workerPath;
    this.options = options;
    this.workerModule = require(workerPath);

    for (const method of this.options.exposedMethods || []) {
      if (method.startsWith("_")) continue;
      this[method] = async (...args) => {
        const fn = this.workerModule[method];
        if (typeof fn !== "function") {
          throw new Error(`Inline worker method not found: ${method} in ${workerPath}`);
        }
        this.options.onActivity?.();
        return await fn(...args);
      };
    }
  }

  async end() {}

  close() {}
}

const workerModulePath = require.resolve("next/dist/lib/worker");
require.cache[workerModulePath] = {
  id: workerModulePath,
  filename: workerModulePath,
  loaded: true,
  exports: {
    Worker: InlineWorker,
    getNextBuildDebuggerPortOffset() {
      return 0;
    },
  },
};

const build = require("next/dist/build").default;
const options = parseArgs(process.argv.slice(2));

await build(
  options.dir,
  false,
  options.debug,
  options.debugPrerender,
  options.runLint,
  options.noMangling,
  options.appDirOnly,
  false,
  options.experimentalBuildMode,
  options.traceUploadUrl,
);
