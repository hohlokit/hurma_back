import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import formData from 'express-form-data'

import { connectDB } from "./db/index.js";
import routes from "./routes/index.js";
import errorHandler from "./mw/error-handler.js";

dotenv.config();

const PORT = process.env.PORT || 9000;

const app = express();

app.use(cors({}));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(formData.parse())

app.use("/api", routes);
app.use(errorHandler);

if (process.env.NODE_ENV === "prod") {
  app.use("*", (_, res) => {
    res.sendFile(path.resolve(__dirname, "client", "dist", "index.html"));
  });
}

connectDB();

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
