const express = require("express");
const app = express();
const port = 3000;
const color = "blue";
const os = require("os");
const hostname = os.hostname();

app.get("/", (req, res) => {
  res.send(`<h1 style="color:${color};">Hello from Color API</h1>
    <h2>Hostname: ${hostname}</h2>`);
});

app.get('/api', (req, res) => {
    const format = req.query;

      if (format == 'json') {
          res.json({ 
              color,
              hostname 
          });
      } else {
          res.send(`Color: ${color}, Hostname: ${hostname}`); 
      }
  });


app.listen(port, () => {
  console.log(`Color API listening on port ${port}`);
});