const CATEGORY_MAPPINGS = {
  "subject": {shorthand: "AccessSubject", url: "urn:oasis:names:tc:xacml:1.0:subject-category:access-subject"},
  "resource": {shorthand: "Resource", url: "urn:oasis:names:tc:xacml:3.0:attribute-category:resource"},
  "action": {shorthand: "Action", url: "urn:oasis:names:tc:xacml:3.0:attribute-category:action"},
  "context": {shorthand: "Environment", url: "urn:oasis:names:tc:xacml:3.0:attribute-category:environment"}
}

const XACML_URLS = {
  "AccessSubject": "urn:oasis:names:tc:xacml:1.0:subject-category:access-subject",
  "Resource": "urn:oasis:names:tc:xacml:3.0:attribute-category:resource",
  "Action": "urn:oasis:names:tc:xacml:3.0:attribute-category:action",
  "Environment": "urn:oasis:names:tc:xacml:3.0:attribute-category:environment"
}

function buildXACMLRequest(authzenRequest) {
  console.log("Entering the AuthZEN - XACML/JSON Translator");
  let wrapper = { Request: { AccessSubject: [{Attribute:[]}], Action: [{Attribute:[]}], Resource: [{Attribute:[]}], Environment: [{Attribute:[]}] } };
  let categories = Object.keys(authzenRequest);
  categories.forEach((category) => {
    if (CATEGORY_MAPPINGS[category]!==undefined){
      console.dir(authzenRequest[category]);
      let attributes = Object.keys(authzenRequest[category]);
      attributes.forEach(attribute => {
        // Add processing of the properties object
        if (attribute==='properties'){
          let props = authzenRequest[category][attribute];
          props.forEach(p => {
            let xacmlAttribute = {AttributeId: p, Value: props[p]};
            wrapper.Request[CATEGORY_MAPPINGS[category].shorthand][0].Attribute.push(xacmlAttribute);
          });
        } else {
          let xacmlAttribute = {AttributeId: attribute, Value: authzenRequest[category][attribute]};
          wrapper.Request[CATEGORY_MAPPINGS[category].shorthand][0].Attribute.push(xacmlAttribute);
        }
      });
    }
  });
  return wrapper;
}

function buildCustomXACMLRequest(authzenRequest){
  console.log("Entering the AuthZEN - custom XACML/JSON Translator");
  let wrapper = { Request: { Category: [] } };
  let denseXACML = buildXACMLRequest(authzenRequest);
  let categories = Object.keys(denseXACML.Request);
  categories.forEach((category) => {
    if (XACML_URLS[category]!==undefined){
      denseXACML.Request[category].forEach((denseCat)=>{
        let cat = {CategoryId: XACML_URLS[category],Attribute:denseCat.Attribute};
        wrapper.Request.Category.push(cat);
      });
    }
  });
  console.log("Custom XACML Request: "+JSON.stringify(wrapper));
  return wrapper;
}

exports.buildXACMLRequest = buildXACMLRequest;
exports.buildCustomXACMLRequest = buildCustomXACMLRequest;
