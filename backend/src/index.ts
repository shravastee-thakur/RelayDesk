import app from "./app.js";
import { env } from "./config/env.js";

const Port = env.PORT;
app.listen(Port, () => {
  console.log(`Server is running on port: http://localhost:${Port}`);
});
