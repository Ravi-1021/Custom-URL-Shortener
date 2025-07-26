const express = require("express");
const path = require("path");
const staticRoute = require("./routes/staticRouter");
const { connectMongoDb } = require("./connect");
const URL = require("./models/url");
const urlRoute = require("./routes/url");
const app = express();
const PORT = 8000;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

connectMongoDb("mongodb://127.0.0.1:27017/short-url").then(() =>
  console.log("MongoDB connected")
);

app.use("/url", urlRoute);
app.get("/:shortId", async (req, res) => {
  const shortId = req.params.shortId;
  const entry = await URL.findOneAndUpdate(
    {
      shortId,
    },
    {
      $push: {
        visitHistory: {
          timestamps: Date.now(),
        },
      },
    }
  );
  res.redirect(entry.redirectUrl);
});
app.use("/", staticRoute);

app.listen(PORT, () => console.log(`Server started at PORT: ${PORT}`));
