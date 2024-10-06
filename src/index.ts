import express from "express";

const app = express();

app.get("/", (req, res) => {
  res.json("Hello from server!");
});

app.listen(3000);
