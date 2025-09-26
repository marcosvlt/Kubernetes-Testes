const express = require("express");
const app = express();
const port = 3000;
const color = "blue";
const os = require("os");
const hostname = os.hostname();

const delay_startup = process.env.DELAY_STARTUP === 'true';
const fail_liveness = process.env.FAIL_LIVENESS === 'true';
const fail_readiness = process.env.FAIL_READINESS === 'true' ? Math.random() < 0.5 : false;

console.log(`delay_startup: ${delay_startup}`);
console.log(`fail_liveness: ${fail_liveness}`);
console.log(`fail_readiness: ${fail_readiness}`);

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

app.get('/ready', (req, res) => {
    if( fail_readiness ) {
        res.status(503);
    } else {
        res.send('Ready');
    }
      
})

app.get('/up', (req, res) => {
        res.send('Ready');
})

app.get('/health', (req, res) => {
  if (fail_liveness) {
      res.status(503);
  } else {
      res.send('Healthy');
  } 
})

if (delay_startup) {
    const start = Date.now();
    // never do this, but for testing purposes only to block everything
    while (Date.now() - start < 60000) {}
}    

app.listen(port, () => {
  console.log(`Color API listening on port ${port}`);
});