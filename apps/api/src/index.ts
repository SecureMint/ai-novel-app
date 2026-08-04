import dotenv from "dotenv";
import { fileURLToPath } from "node:url";
import { createApp } from "./app.js";
dotenv.config({
  path: fileURLToPath(new URL("../../../.env", import.meta.url)),
});
const port = Number(process.env.API_PORT || 4000);
createApp().listen(port, "127.0.0.1", () =>
  console.log(`Novel API listening on http://127.0.0.1:${port}`),
);
