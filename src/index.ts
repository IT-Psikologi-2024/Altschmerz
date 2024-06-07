require("dotenv").config();
import express from "express";
import cors from "cors";

const PORT: string = process.env.PORT!;

const app = express();

const whitelist: string[] = []; // An empty whitelist allows all origins

const corsOptions: cors.CorsOptions = {
  origin: function (
    origin: string | undefined,
    callback: (error: Error | null, allow?: boolean) => void
  ) {
    if (!origin || whitelist.length === 0 || whitelist.includes(origin)) {
      // Allow requests with no origin (e.g., same-origin requests or server-to-server requests)
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/upload", require("./routes/uploadRoutes"));
app.use("/sheet", require("./routes/sheetRoutes"));
app.use("/email", require("./routes/emailRoutes"));

app.listen(PORT, () => {
  console.log(`Server listening on port: ${PORT}`);
});