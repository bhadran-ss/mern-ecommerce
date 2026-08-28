import mongoose from "mongoose";
import { getConfig } from "../config/env.js";

const { mongoUri } = getConfig();

mongoose
  .connect(mongoUri)
  .then(() => {
    console.log("Connection created in db...");
  })
  .catch((err) => {
    console.log("Connection not created..", err);
  });
