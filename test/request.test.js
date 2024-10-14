const { buildXACMLRequest, buildCustomXACMLRequest } = require('../src/buildXACMLRequest');
var assert = require('assert');
describe('XACML Conversion', function () {
  describe('#buildXACMLRequest()', function () {
    it('should translate an AuthZEN request into a XACML request', function () {
        let result = false;
        let expected = false;
        let authzenRequest = {
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
        let wrapper = buildXACMLRequest(authzenRequest);
        console.log(JSON.stringify(wrapper));
        assert.equal(result, expected);
    });
  });
});