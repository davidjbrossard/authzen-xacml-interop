const { buildXACMLRequest, buildCustomXACMLRequest } = require('../src/buildXACMLRequest');
var assert = require('assert');

let singleAuthzenRequest = {
  "subject": {
    "type": "user",
    "id": "alice@acmecorp.com"
  },
  "resource": {
    "type": "account",
    "id": "123"
  },
  "action": {
    "name": "can_read",
    "properties": {
      "method": "GET"
    }
  },
  "context": {
    "time": "1985-10-26T01:22-07:00"
  }
};

let boxcarAuthZENRequest = {
  "evaluations": [
    {
      "subject": {
        "type": "user",
        "id": "alice@acmecorp.com"
      },
      "action": {
        "name": "can_read"
      },
      "resource": {
        "type": "document",
        "id": "boxcarring.md"
      },
      "context": {
        "time": "2024-05-31T15:22-07:00"
      }
    },
    {
      "subject": {
        "type": "user",
        "id": "alice@acmecorp.com"
      },
      "action": {
        "name": "can_read"
      },
      "resource": {
        "type": "document",
        "id": "subject-search.md"
      },
      "context": {
        "time": "2024-05-31T15:22-07:00"
      }
    },
    {
      "subject": {
        "type": "user",
        "id": "alice@acmecorp.com"
      },
      "action": {
        "name": "can_read"
      },
      "resource": {
        "type": "document",
        "id": "resource-search.md"
      },
      "context": {
        "time": "2024-05-31T15:22-07:00"
      }
    }
  ]
};

describe('#buildXACMLRequest(authzenRequest)', function () {
  it('should translate a single AuthZEN request into a XACML request', function () {
      let wrapper = buildXACMLRequest(singleAuthzenRequest);
      console.log(JSON.stringify(wrapper));
      // Check the outcome does not contain a MultiRequests
      assert.equal(wrapper.Request.hasOwnProperty("MultiRequests"), false);
      // Check the outcome has 4 categories - just like the input
      assert.equal(wrapper.Request.hasOwnProperty("AccessSubject"), true);
      assert.equal(wrapper.Request.hasOwnProperty("Action"), true);
      assert.equal(wrapper.Request.hasOwnProperty("Resource"), true);
      assert.equal(wrapper.Request.hasOwnProperty("Environment"), true);
      // FUTURE: validate that the XACML request is indeed a valid XACML request
  });
});
describe('#buildXACMLRequest(authzenRequest,12)', function () {
  it('should translate a single AuthZEN request into a single MDP XACML request', function () {
    let wrapper = buildXACMLRequest(singleAuthzenRequest, 12);
    console.log(JSON.stringify(wrapper));
    // Check the outcome does not contain a RequestReference array of size 1
    assert.equal(wrapper.Request.hasOwnProperty("MultiRequests"), false);
    // FUTURE: validate that the XACML request is indeed a valid XACML request
  });
});
describe('#buildXACMLRequest(authzenRequest, "id3")', function () {
  it('should translate a boxcarred AuthZEN request into a multiple MDP XACML request', function () {
    let wrapper = buildXACMLRequest(boxcarAuthZENRequest, "id3");
    console.log(JSON.stringify(wrapper));
    // Check the outcome contains a RequestReference array of the same size as the evaluations array in the AuthZEN request
    assert.equal(wrapper.Request.MultiRequests.RequestReference.length, boxcarAuthZENRequest.evaluations.length);
    // FUTURE: validate that the XACML request is indeed a valid XACML request
  });
});