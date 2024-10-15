const { translateXACMLResponse} = require('../src/translateXACMLResponse');
var assert = require('assert');

let terseXacmlMDPResponse = {
  "Response": [
    {
        "Decision": "Permit",
    },
    {
        "Decision": "Deny",
    },
    {
        "Decision": "NotApplicable",
    }
  ] 
};

let xacmlSingleResponse = {
    "Response": [
        {
            "Decision": "NotApplicable",
        }
    ] 
};

describe('#translateXACMLResponse(xacmlResponse)', function () {
  it('should translate a single XACML JSON response into a single AuthZEN Response', function () {
    let response = translateXACMLResponse(xacmlSingleResponse);
    assert.equal(response.hasOwnProperty("decision"), true);
    assert.equal(response.hasOwnProperty("evaluations"), false);
    assert.equal(typeof response.decision == "boolean", true);
  });
});

describe('#translateXACMLResponse(xacmlResponse)', function () {
  it('should translate an MDP XACML response into an AuthZEN Boxcar Response', function () {
    let response = translateXACMLResponse(terseXacmlMDPResponse);
    assert.equal(response.evaluations.length,terseXacmlMDPResponse.Response.length, "Size is incorrect");
    for (let i = 0; i < response.evaluations.length; i++){
      assert.equal(terseXacmlMDPResponse.Response[i].Decision=="Permit",response.evaluations[i].decision, "Mismatch in decisions");
    }
  });
});