import express from "express";
import { config, checkConfig } from './config';
import HyperledgerService from './services/HyperledgerService';
import { authRoutes, transactionRoutes } from './routes';
import cookieParser from 'cookie-parser';
import cors from "cors";
import { authMiddleware } from './middlewares/authMiddleware';

async function main() {
    checkConfig();
    await HyperledgerService.init();

    const app = express();
    app.use(express.json());
    app.use(cors());
    app.use(cookieParser());

    app.use('/auth', authRoutes);

    app.use(authMiddleware)

    app.use('/tx', transactionRoutes);

    const server = app.listen(
        {
            port: process.env.PORT || 3003,
            host: process.env.HOST || "0.0.0.0",
        },
        () => {
            console.log(`
        Server is running!
        Listening on ${process.env.HOST || "0.0.0.0"}:${process.env.PORT || 3003}
      `);
        }
    );
}

main();