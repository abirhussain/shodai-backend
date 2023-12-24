import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import App from "./app";
import appRoutes from "./config/routes/routes";

dotenv.config();

const app = new App({
	port: process.env.PORT || 5000,
	middlewares: [
		express.json(),
		express.urlencoded({ extended: false }),
		cors(),
	],
	mongoURL: process.env.MONGO_URI || "",
	routes: appRoutes,
});

app.listen();
