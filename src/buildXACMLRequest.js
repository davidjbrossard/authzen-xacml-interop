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

function buildXACMLRequest(authzenRequest, prefix = "") {
  console.log("Entering the AuthZEN - XACML/JSON Translator");
  let wrapper = { Request: { AccessSubject: [], Action: [], Resource: [], Environment: [] } };
  let categories = Object.keys(authzenRequest);
  let mdp = authzenRequest.evaluations!==undefined; // if evaluations is present, treat as MDP

  if (mdp) {
    wrapper.Request.MultiRequests = {RequestReference:[]};
    // Now process the array of individual evaluations
    let counter = 0;
    authzenRequest.evaluations.forEach(singleEval => {
      let ref = {ReferenceId:[]};
      let categories = Object.keys(singleEval);
      categories.forEach((category) => {
        if (CATEGORY_MAPPINGS[category]!==undefined){
          let xc = processCategory(singleEval[category], CATEGORY_MAPPINGS[category], mdp, ref, prefix, counter);
          wrapper.Request[CATEGORY_MAPPINGS[category].shorthand].push(xc);
        }
      });        
      let counterRefId = 'Environment_'+prefix+counter;
      let counterAttribute = {Attribute: [{ AttributeId: 'counter', Value: counter, IncludeInResult: true }], Id: counterRefId};
      wrapper.Request['Environment'].push(counterAttribute);
      ref.ReferenceId.push(counterRefId);
      wrapper.Request.MultiRequests.RequestReference.push(ref);
      counter++;
    });
  }
  categories.forEach((category) => {
    if (CATEGORY_MAPPINGS[category]!==undefined){
      let xc = processCategory(authzenRequest[category], CATEGORY_MAPPINGS[category]);
      if (mdp){
        // Consider these as add-on attributes to the individual elements
        wrapper = merge(CATEGORY_MAPPINGS[category], xc, wrapper);
      } else {
        wrapper.Request[CATEGORY_MAPPINGS[category].shorthand].push(xc);
      }
    }
  });
  console.log(JSON.stringify(wrapper));
  return wrapper;
}

function merge(targetCategory, extraAttributes, mdpRequest){
  // console.log("################################# The things that need to be merged ###########")
  // console.log("Extra attributes: " + JSON.stringify(extraAttributes));
  extraAttributes.Id=targetCategory.shorthand+1;
  mdpRequest.Request[targetCategory.shorthand].push(extraAttributes);
  // console.log("mdpRequest.MultiRequests ====== "+mdpRequest.Request.MultiRequests);
  mdpRequest.Request.MultiRequests.RequestReference.forEach(element => {
    element.ReferenceId.push(targetCategory.shorthand+1);
  });
  // console.log(JSON.stringify(mdpRequest));
  // console.log("################################# END The things that need to be merged ###########");
  return mdpRequest;
}

function processCategory(singleCat, mapping, mdp = false, ref, prefix="", counter=0){
  let xacmlCategory = {Attribute: []};
  if (mdp){
    let localId = mapping.shorthand+"_"+prefix+counter;
    xacmlCategory.Id=localId;
    ref.ReferenceId.push(localId);
  }
  let attributes = Object.keys(singleCat);
  attributes.forEach(attribute => {
    // Add processing of the properties object
    if (attribute==='properties'){
      let props = singleCat[attribute];
      let propNames = Object.keys(props);
      propNames.forEach(p => {
        let xacmlAttribute = {AttributeId: p, Value: props[p]};
        // if (mdp){
        //   xacmlAttribute.IncludeInResult = true;
        // }
        xacmlCategory.Attribute.push(xacmlAttribute);
      });
    } else {
      let xacmlAttribute = {AttributeId: attribute, Value: singleCat[attribute]};
      // if (mdp){
      //   xacmlAttribute.IncludeInResult = true;
      // }
      xacmlCategory.Attribute.push(xacmlAttribute);
    }
  });
  return xacmlCategory;
}

// TODO: test this function
function buildVerboseXACMLRequest(authzenRequest, identifier){
  console.log("Entering the AuthZEN - verbose XACML/JSON Translator");
  let wrapper = { Request: { Category: [] } };
  let mdp = authzenRequest.evaluations!==undefined; // if evaluations is present, treat as MDP
  let denseXACML = buildXACMLRequest(authzenRequest, identifier);
  let categories = Object.keys(denseXACML.Request);
  categories.forEach((category) => {
    if (XACML_URLS[category]!==undefined){
      denseXACML.Request[category].forEach((denseCat)=>{
        let cat = {CategoryId: XACML_URLS[category],Attribute:denseCat.Attribute};
        if (denseCat.Id!==undefined){
          cat.Id = denseCat.Id;
        }
        wrapper.Request.Category.push(cat);
      });
    }
  });
  if (mdp){
    // Add the ref elements
    wrapper.Request.MultiRequests=denseXACML.MultiRequests;

  }
  console.log("Custom XACML Request: "+JSON.stringify(wrapper));
  return wrapper;
}

exports.buildXACMLRequest = buildXACMLRequest;
exports.buildVerboseXACMLRequest = buildVerboseXACMLRequest;
