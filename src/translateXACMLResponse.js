function translateXACMLResponse(xacmlResponse) {
  console.log('Translating XACML response into AuthZEN response');
  let authZenResponse = { decision: false };
  try {
    console.log('Should access be allowed?' + xacmlResponse.data.Response[0].Decision==='Permit');
    authZenResponse.decision = xacmlResponse.data.Response[0].Decision==='Permit';
  } catch (error) {
    console.error('Couldn\'t parse XACML Response');
    console.error(error);
  }
  return authZenResponse;
}
exports.translateXACMLResponse = translateXACMLResponse;