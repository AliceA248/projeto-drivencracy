import express from "express";
import { json } from "express";
import cors from "cors";
import router from "./routes/router.js";

const app = express();
app.use(cors());
app.use(json());

app.use(router);

const PORT = 5009

app.listen(PORT, () => {
  console.log(`Now listening on ${PORT}`);
});