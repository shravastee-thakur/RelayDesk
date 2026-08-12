import app from "./app.js";
import { env } from "./config/env.js";
import logger from "./utils/logger.js";

const Port = env.PORT;
app.listen(Port, () => {
  logger.info(`Server is running on port: http://localhost:${Port}`);
});
