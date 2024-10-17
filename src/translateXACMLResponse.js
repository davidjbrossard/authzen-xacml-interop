function translateXACMLResponse(xacmlResponse) {
  console.log('Translating XACML response into AuthZEN response');
  if (xacmlResponse.Response===undefined){
    throw new Error ('Invalid XACML Response '+ xacmlResponse);
  }
  let mdp = xacmlResponse.Response.length>1;
  console.log('We are processing a multiple decision profile response' );
  let authZenResponse = {};
  if (mdp){
    authZenResponse = { evaluations: [] };
    console.log(JSON.stringify(xacmlResponse));
    xacmlResponse.Response.forEach(response => {
      if (response.Category!==undefined && Array.isArray(response.Category)){
        response.Category.forEach(cat => {
          if (cat.CategoryId==='urn:oasis:names:tc:xacml:3.0:attribute-category:environment'){
            if (cat.Attribute!==undefined && Array.isArray(cat.Attribute)){
              cat.Attribute.forEach(attr => {
                if (attr.AttributeId==='counter'){
                  console.log('Found the counter:');
                  console.log(attr.Value);
                  console.log('Inserting response in array at position '+attr.Value);
                  authZenResponse.evaluations[attr.Value]={decision: response.Decision==='Permit'}
                }
              });
            }
          }
        });
      }
      // console.log("Should access be allowed? " + (response.Decision==='Permit'));
      // authZenResponse.evaluations.push({decision: response.Decision==='Permit'});      
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