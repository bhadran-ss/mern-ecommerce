export const initializeDependencies = async ({
  config,
  logger,
  configureCloudinary,
  initializeStripe,
  connectDatabase,
  connectRedis,
}) => {
  configureCloudinary(config.cloudinary);
  initializeStripe(config.stripeSecretKey);

  logger.info("Connecting application dependencies");
  await connectDatabase(config.mongoUri);
  logger.info("MongoDB connection established");
  await connectRedis(config.redisUrl);
  logger.info("Redis connection established");
};
