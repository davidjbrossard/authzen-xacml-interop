const express = require('express');
const {readFileSync} = require('fs');
const handlebars = require('handlebars');
const axios = require('axios');
const { buildXACMLRequest } = require('./buildXACMLRequest');
const { translateXACMLResponse } = require('./translateXACMLResponse');
const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');

const URL = 'http://ec2-3-92-139-55.compute-1.amazonaws.com/authorize';
const USERNAME = 'ads-user';

const client = new SecretManagerServiceClient();
async function accessSecret() {
  const [version] = await client.accessSecretVersion({
    name: 'projects/549681914412/secrets/PDP_PASSWORD/versions/1',
  });
  const payload = version.payload.data.toString('utf8');
  PASSWORD = payload;
}

const app = express();
app.use(express.json());
// Serve the files in /assets at the URI /assets.
app.use('/www/assets', express.static('assets'));
app.use('/www/images', express.static('images'));

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

app.post('/access/v1/evaluations', async (req, res) => {
  let isError = false;
  let authZenResponse = { decision: true };
  let xacmlResponse;
  await accessSecret();
  console.log('Entering AuthZEN XACML Proxy');
  // 1. Prepare request to XACML Authorization Service (PDP)
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
    xacmlResponse = xr;
    console.log('PDP replied fine so processing response');
    console.log('Processing response and returning 200');
    console.log(xacmlResponse);
    res.status(200).send(translateXACMLResponse(xacmlResponse)).contentType('application/json');
  })
  .catch(function (error) {
    console.log('Processing error and returning 500');
    console.error('AuthZEN - XACML Exception Whoops!');
    console.error(error);
    isError = true;
    res.status(500).send(error);
  });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(
    `Hello from Cloud Run! The container started successfully and is listening for HTTP requests on ${PORT}`
  );
});
