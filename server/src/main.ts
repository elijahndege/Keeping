import * as dotenv from "dotenv";
dotenv.config();
import * as cookie from "cookie-parser";
import * as pg from "pg";
import * as session from "express-session";
import * as ConnectPgSimple from "connect-pg-simple";
import * as passport from "passport";
import * as cors from "cors";
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { APP_CONFIG } from "./configs/app.config";
import { join } from 'path';
import * as express from 'express';
import * as serveStatic from 'serve-static';

async function bootstrap() {
  try {
    const { port, cookieSecret, sessionSecret } = APP_CONFIG;
    const app = await NestFactory.create(AppModule);
    app.use(cookie(cookieSecret));

    const pgSession = new ConnectPgSimple(session);
    const pgPool = new pg.Pool({
      user: APP_CONFIG.databaseUsername,
      host: APP_CONFIG.databaseHost,
      database: APP_CONFIG.databaseName,
      password: APP_CONFIG.databasePassword,
      port: APP_CONFIG.databasePort,
    });
    app.use(
      session({
        resave: false,
        saveUninitialized: true,
        secret: sessionSecret,
        store: new pgSession({
          pool: pgPool,
        }),
      }),
    );
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(cors({
      origin: ['http://localhost:3000'],
      credentials: true
    }));
    console.log(join(__dirname, '..', 'public'));
    app.use('/public', serveStatic(join(__dirname, '..','public'), {}));
    // app.useStaticAssets(join(__dirname, '..', 'public'));
    
    await app.listen(port);
  } catch (error) {
    console.log(error)
  }
}
bootstrap();
