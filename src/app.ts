import 'reflect-metadata';
import './config/aliases';
import dotenv from 'dotenv';
dotenv.config({
  path: `./env/${process.env.NODE_ENV || 'development'}.env`,
});

import express, { Express, Request, Response } from 'express';
const port = process.env.PORT;

class App {
  app: Express;
  constructor() {
    this.app = express();
    this.init();
  }

  private init(): void {
    this.app.listen(port, () => {
      console.log(`Server started at http://localhost:${port}`);
      console.log(`Running mode: ${process.env.NODE_ENV}`);
    });

    this.app.get('/', (req: Request, res: Response) =>
      res.sendFile('views/index.html', { root: __dirname }),
    );
  }
}

new App();

export { App };
