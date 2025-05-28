import express, { Request, Response } from "express";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get("/instagram/data", (req: Request, res: Response) => {
  const user = {
    clientId: process.env.CLIENT_ID,
    redirectUri: process.env.REDIRECT_URI,
  };
  res.json(user);
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
