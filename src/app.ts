import express, { Application, NextFunction, Router } from "express";
import { Schema, model, connect } from "mongoose";

class App {
	public app: Application;
	public port: number | string;

	constructor(appInit: {
		port: number | string;
		middlewares: any[];
		mongoURL: string;
		routes: any[];
	}) {
		this.app = express();
		this.port = appInit.port;

		this.initMiddlewares(appInit.middlewares);
		this.connectDB(appInit.mongoURL);
		this.initRoutes(appInit.routes);
	}

	private initMiddlewares(middlewares: any[]) {
		middlewares.forEach((middleware: NextFunction) => {
			this.app.use(middleware);
		});
	}

	private async connectDB(mongoURL: string): Promise<void> {
		try {
			await connect(mongoURL);
			console.log("Database connected successfully");
		} catch (err: any) {
			console.log("Database connection failed!", err.message);
		}
	}

	private initRoutes(appRoutes: any[]): void {
		appRoutes.forEach((appRoutes: any) => {
			this.app.use("/api", appRoutes.router);
		});
	}

	public listen() {
		this.app.listen(this.port, () => {
			console.log(`App is listening on port No : ${this.port}`);
		});
	}
}

export default App;
