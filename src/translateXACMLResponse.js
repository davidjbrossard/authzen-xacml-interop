const allowed = { decision: true };
function translateXACMLResponse(xacmlResponse) {
  console.log('translating XACML response into AuthZEN response');
  console.dir(xacmlResponse.data);
  let authZenResponse = allowed;
  try {
    console.log('Should access be allowed?' + xacmlResponse.data.Response[0].Decision==='Permit');
    authZenResponse.decision = xacmlResponse.data.Response[0].Decision==='Permit';
  } catch (error) {
    console.log('Couldn\'t parse XACML Response');
    console.error(error);
  }
  return authZenResponse;
}
exports.translateXACMLResponse = translateXACMLResponse;