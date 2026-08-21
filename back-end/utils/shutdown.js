const closeHttpServer = (server, timeoutMs) =>
  new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      server.closeAllConnections?.();
      reject(new Error("HTTP server shutdown timed out."));
    }, timeoutMs);
    timeout.unref?.();

    server.close((error) => {
      clearTimeout(timeout);
      if (error) reject(error);
      else resolve();
    });
  });

export const createShutdown = ({
  server,
  logger,
  disconnectDatabase,
  disconnectRedis,
  timeoutMs = 10_000,
}) => {
  let shutdownPromise;

  return (signal) => {
    if (shutdownPromise) return shutdownPromise;

    shutdownPromise = (async () => {
      logger.info("Graceful shutdown started", { signal });
      const httpResult = await Promise.allSettled([
        closeHttpServer(server, timeoutMs),
      ]);
      const dependencyResults = await Promise.allSettled([
        disconnectDatabase(),
        disconnectRedis(),
      ]);
      const results = [...httpResult, ...dependencyResults];
      const failures = results.filter((result) => result.status === "rejected");

      if (failures.length > 0) {
        logger.error("Graceful shutdown completed with errors", {
          signal,
          errors: failures.map((failure) => failure.reason),
        });
        throw new AggregateError(
          failures.map((failure) => failure.reason),
          "One or more shutdown operations failed.",
        );
      }

      logger.info("Graceful shutdown completed", { signal });
    })();

    return shutdownPromise;
  };
};

export const registerShutdownHandlers = ({ shutdown, logger }) => {
  const handleSignal = (signal) => {
    shutdown(signal).catch((error) => {
      logger.error("Graceful shutdown failed", { signal, error });
      process.exitCode = 1;
    });
  };

  process.once("SIGINT", () => handleSignal("SIGINT"));
  process.once("SIGTERM", () => handleSignal("SIGTERM"));
};
