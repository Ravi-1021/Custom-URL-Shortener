const express = require("express");
const path = require("path");
const cookieParser=require("cookie-parser")
const { connectMongoDb } = require("./connect");
const { restrictToLoggedInUserOnly, checkAuth } = require("./middlewares/auth");
const URL = require("./models/url");
const app = express();
const PORT = 8000;

const urlRoute = require("./routes/url");
const staticRoute = require("./routes/staticRouter");
const userRoute = require("./routes/user");




app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

connectMongoDb("mongodb://127.0.0.1:27017/short-url").then(() =>
  console.log("MongoDB connected")
);

app.use("/url", restrictToLoggedInUserOnly,urlRoute);
app.get("/url/:shortId", async (req, res) => {
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
app.use("/",checkAuth, staticRoute);
app.use("/user",userRoute);


app.listen(PORT, () => console.log(`Server started at PORT: ${PORT}`));
