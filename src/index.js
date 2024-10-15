const express = require('express');
const {readFileSync} = require('fs');
const handlebars = require('handlebars');
const { buildXACMLRequest, buildVerboseXACMLRequest } = require('./buildXACMLRequest');
const { translateXACMLResponse } = require('./translateXACMLResponse');
const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');
const axios = require('axios');

const URLS = {
  axiomatics: {
    url: 'https://ads-authzen-interop-vji43cydea-uc.a.run.app/application/authorize',
    username: 'authz-user'
  },
  thales: {
    url: 'https://restful-pdp-vji43cydea-uc.a.run.app/services/pdp'
  }
};

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

app.post('/access/v1/evaluation', evaluationHandler);

async function evaluationHandler(req, res){
  await accessSecret();
  console.log('Entering AuthZEN XACML Proxy - Single Request');
  // 1. Prepare request to XACML Authorization Service (PDP)
  axios.post(URLS.axiomatics.url, 
    // 1.a Translate the incoming request from AuthZEN into XACML
      buildXACMLRequest(req.body),
      {
        auth: {
          username: URLS.axiomatics.username,
          password: PASSWORD
        },
        headers: {
          'Content-Type': 'application/json'
        }
      }
  )
  // 2. Process the response - convert from a XACML/JSON response into an AuthZEN response
  .then(function (xr) {
    console.log('Processing response from PDP and translating from XACML into AuthZEN');
    res.status(200).contentType('application/json').send(translateXACMLResponse(xr.data));
  })
  .catch(function (error) {
    console.error('Error invoking the PDP or processing the response.');
    console.error(error);
    res.status(500).send('Could not complete the request. Please check your logs.');
  });
}

app.post('/access/v1/evaluations', evaluationsHandler);

async function evaluationsHandler(req, res) {
  await accessSecret();
  console.log('Entering AuthZEN XACML Proxy - MDP Request');
  // 1. Prepare request to XACML Authorization Service (PDP)
  axios.post(URLS.axiomatics.url, 
    // 1.a Translate the incoming request from AuthZEN into XACML
      buildXACMLRequest(req.body, "mdp_"),
      {
        auth: {
          username: URLS.axiomatics.username,
          password: PASSWORD
        },
        headers: {
          'Content-Type': 'application/json'
        }
      }
  )
  // 2. Process the response - convert from a XACML/JSON response into an AuthZEN response
  .then(function (xr) {
    console.log('Processing response from PDP and translating from XACML into AuthZEN');
    res.status(200).contentType('application/json').send(translateXACMLResponse(xr.data));
  })
  .catch(function (error) {
    console.error('Error invoking the PDP or processing the response.');
    console.error(error);
    res.status(500).send('Could not complete the request. Please check your logs.');
  });
}


app.post('/thales/access/v1/evaluation', async (req, res) => {
  callPDP(req, res, URLS.thales.url,'','', true);
});

function callPDP(req, res, url, username, password, custom){
  console.log('Entering AuthZEN XACML Proxy');
  // 1. Prepare request to XACML Authorization Service (PDP)
  let payload = custom? buildVerboseXACMLRequest(req.body):buildXACMLRequest(req.body);
  axios.post(url, 
    // 1.a Translate the incoming request from AuthZEN into XACML
      payload,
      {
        auth: {
          username: username,
          password: password
        },
        headers: {
          'Content-Type': 'application/json'
        }
      }
  )
  // 2. Process the response - convert from a XACML/JSON response into an AuthZEN response
  .then(function (xr) {
    console.log('Processing response from PDP and translating from XACML into AuthZEN');
    res.status(200).contentType('application/json').send(translateXACMLResponse(xr.data));
  })
  .catch(function (error) {
    console.error('Error invoking the PDP or processing the response.');
    console.error(error);
    res.status(500).send('Could not complete the request. Please check your logs.');
  });
}

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(
    `AuthZEN-to-XACML Proxy now running on port ${PORT}`
  );
});
