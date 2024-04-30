const CATEGORY_MAPPINGS = {
  "subject": "AccessSubject",
  "resource": "Resource",
  "action": "Action",
  "context": "Environment"
}

function buildXACMLRequest(authzenRequest) {
  console.log("Entering the AuthZEN - XACML/JSON Translator");
  let wrapper = { Request: { AccessSubject: [{Attribute:[]}], Action: [{Attribute:[]}], Resource: [{Attribute:[]}], Environment: [{Attribute:[]}] } };
  let categories = Object.keys(authzenRequest);
  categories.forEach((category) => {
    // console.log('Found category '+category);
    if (CATEGORY_MAPPINGS[category]!==undefined){
      // console.log('Mapped to XACML category '+CATEGORY_MAPPINGS[category]);
      // console.log('contents of '+category+': '+authzenRequest[category]);
      console.dir(authzenRequest[category]);
      let attributes = Object.keys(authzenRequest[category]);
      attributes.forEach(attribute => {
        // console.log('Found attribute '+attribute);
        // console.log('Found value '+authzenRequest[category][attribute]);
        let xacmlAttribute = {AttributeId: attribute, Value: authzenRequest[category][attribute]};
        wrapper.Request[CATEGORY_MAPPINGS[category]][0].Attribute.push(xacmlAttribute);
      });
    }
  });
  return wrapper;
}

exports.buildXACMLRequest = buildXACMLRequest;
