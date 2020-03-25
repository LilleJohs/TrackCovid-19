const express = require('express');
const cors = require('cors');
const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');
const helmet = require('helmet');

const app = express();

function httpsRedirect(req, res, next) {
  // Redirect to https
  if(req.headers["x-forwarded-proto"] === "https"){
    return next();
  };
  res.redirect(301, 'https://' + req.hostname + req.url);
}

app.set('trust proxy', true);

app.use(cors());
app.use(helmet());

let allCountryYML = new Object();
let summaryYML;
updateYMLFiles();

setInterval(updateYMLFiles, 60*60*1000);

function updateYMLFiles() {
  newAllCountryYML = new Object();

  
  app.use(express.static(path.join(__dirname, 'public')));
  fs.readdirSync("public/").forEach(file => {
    if (file !== 'summary.yml') {
      const ymlFile = yaml.safeLoad(fs.readFileSync('public/'+file, 'utf8'));
      newAllCountryYML[file.split('.')[0]] = ymlFile;
    }
  });

  allCountryYML = newAllCountryYML;
  summaryYML = yaml.safeLoad(fs.readFileSync('public/summary.yml', 'utf8'));
  console.log('Reloaded the YML files');
}

app.get('/summary', async (req, res) => {
  //Send summary of all countries
  try {
    res.send(summaryYML);
  } catch (e) {
    console.log(e);
  }
});

app.get('/country', async (req, res) => {
  //Send country specific information
  try {
    const country = allCountryYML[req.query.name];
    console.log(req.query)
    if (country != null) {
      res.send(country);
    } else {
      res.send('NO_DATA');
    }
  } catch (e) {
    console.log(e);
  }
});

if (process.env.NODE_ENV === 'production') {
  app.use(httpsRedirect);
  app.use(express.static('client/build'));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

const PORT = process.env.PORT || 5000;
app.listen(PORT);
