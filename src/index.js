const express = require('express');
const {readFileSync} = require('fs');
const handlebars = require('handlebars');
const { buildXACMLRequest } = require('./buildXACMLRequest');
const { translateXACMLResponse } = require('./translateXACMLResponse');
const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');

// const URL = 'http://ec2-3-92-139-55.compute-1.amazonaws.com/authorize';
const URL = 'https://ads-authzen-interop-vji43cydea-uc.a.run.app/application/authorize';
// const USERNAME = 'ads-user';
const USERNAME = 'authz-user';

const client = new SecretManagerServiceClient();
async function accessSecret() {
  const [version] = await client.accessSecretVersion({
    name: 'projects/549681914412/secrets/PDP_PASSWORD/versions/2',
  });
  const payload = version.payload.data.toString('utf8');
  PASSWORD = payload;
}

const app = express();
app.use(express.json());
// Serve the files in /assets at the URI /assets.
// app.use('/assets', express.static('assets'));
app.use('/assets', express.static('www/assets'));
app.use('/images', express.static('www/images'));

// The HTML content is produced by rendering a handlebars template.
// The template values are stored in global state for reuse.
const data = {
  service: process.env.K_SERVICE || '???',
  revision: process.env.K_REVISION || '???',
};
let template;

app.get('/', async (req, res) => {
  // The handlebars template is stored in global state so this will only once.
  if (!template) {
    // Load Handlebars template from filesystem and compile for use.
    try {
      template = handlebars.compile(readFileSync('www/index.html', 'utf8'));
    } catch (e) {
      console.error(e);
      res.status(500).send('Internal Server Error');
    }
  }

  // Apply the template to the parameters to generate an HTML string.
  try {
    const output = template(data);
    res.status(200).send(output);
  } catch (e) {
    console.error(e);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/access/v1/evaluation', async (req, res) => {
  await accessSecret();
  console.log('Entering AuthZEN XACML Proxy');
  // 1. Prepare request to XACML Authorization Service (PDP)
  const axios = require('axios');
  axios.post(URL, 
    // 1.a Translate the incoming request from AuthZEN into XACML
      buildXACMLRequest(req.body),
      {
        auth: {
          username: USERNAME,
          password: PASSWORD
        },
        headers: {
          'Content-Type': 'application/json'
        }
      }
  )
  // 2. Process the response - convert from a XACML/JSON response into an AuthZEN response
  .then(function (xr) {
    console.log('PDP replied fine so processing response');
    console.log('Processing response and returning 200');
    res.status(200).contentType('application/json').send(translateXACMLResponse(xr));
  })
  .catch(function (error) {
    console.log('Processing error and returning 500');
    console.error('AuthZEN - XACML Exception Whoops!');
    console.error(error);
    res.status(500).send(error);
  });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(
    `Hello from Cloud Run! The container started successfully and is listening for HTTP requests on ${PORT}`
  );
});
