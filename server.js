require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const dns = require("dns");
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));

app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// Your first API endpoint
app.get("/api/hello", function (req, res) {
  res.json({ greeting: "hello API" });
});

const urls = [];
app.post("/api/shorturl", function (req, res) {
  let url = req.body.url;
  if (!url.startsWith("http")) {
    url = "http://" + url;
  }
  if (url) {
    try {
      const { hostname } = new URL(url);
      dns.lookup(hostname, (err, addresses) => {
        if (err) {
          res.json({ error: "Invalid URL" });
        } else {
          urls.push(url);
          res.json({
            original_url: url,
            short_url: urls.length - 1,
          });
        }
      });
    } catch (error) {
      res.json({ error: "Invalid URL" });
    }
  } else {
    res.json({ error: "Invalid URL" });
  }
});

app.get("/api/shorturl/:id", function (req, res) {
  if (!/^\d+$/.test(req.params.id)) {
    res.json({ error: "Wrong format" });
  } else {
    let id = parseInt(req.params.id);
    let url = urls[id];
    if (!url) {
      res.json({ error: "No short URL found for the given input" });
    } else {
      res.redirect(url);
    }
  }
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
