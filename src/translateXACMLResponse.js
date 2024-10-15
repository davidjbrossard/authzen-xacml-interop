function translateXACMLResponse(xacmlResponse) {
  console.log('Translating XACML response into AuthZEN response');
  let mdp = xacmlResponse.Response.length>1;
  let authZenResponse = {};
  if (mdp){
    authZenResponse = { evaluations: [] };
    xacmlResponse.Response.forEach(response => {
      authZenResponse.evaluations.push({decision: response.Decision==='Permit'});      
    });
    
  } else {
    authZenResponse = { decision: false };
    try {
      console.log('Should access be allowed?' + xacmlResponse.Response[0].Decision==='Permit');
      authZenResponse.decision = xacmlResponse.Response[0].Decision==='Permit';
    } catch (error) {
      console.error('Couldn\'t parse XACML Response');
      console.error(error);
    }
  }
  return authZenResponse;
}
exports.translateXACMLResponse = translateXACMLResponse;