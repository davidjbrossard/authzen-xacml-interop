# OpenID AuthZEN to XACML REST/JSON Proxy
This sample Node.JS application takes in an AuthZEN authorization request, converts it to a XACML REST/JSON request, sends it off to a XACML-compliant PDP, receives a XACML REST/JSON response, converts it to an AuthZEN decision and returns that decision to the client.

# The Magic
The code uses Express to expose a REST service and Axios to implement a client that connects to a remote XACML-compliant PDP.

The parsing between AuthZEN and XACML takes place in [buildXACMLRequest.js](buildXACMLRequest.js) and [translateXACMLResponse.js](translateXACMLResponse.js).

For the time being, only the actual decision is supported. Obligations and advice (XACML) as well as additional features are not in scope for this interop.

# Deployment

## Google Cloud Runtime

1. Use Docker to build a container: `docker build .`
2. Tag your docker image
3. Push docker image to the GCR Registry

# Useful Links
 - OpenID [AuthZEN Working Group](https://openid.net/wg/authzen/)
 - OASIS [XACML REST/JSON](https://docs.oasis-open.org/xacml/xacml-json-http/v1.1/xacml-json-http-v1.1.html)
 - AuthZEN [Interop Website](https://authzen-interop.net/)
 - AuthZEN Sample [Request/Response Collection](https://www.postman.com/axiomatics/workspace/authzen-sample-requests/)