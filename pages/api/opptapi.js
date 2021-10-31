
module.exports = async (req, res) => {
  console.log("call Opportunity Save")
  const { recName, recID, assetType, bedRooms, bathRooms, 
    livingAreaSqft, nonLivingAreaSqft, landSqft, yearBuilt, asaID, assetValue, 
    assetValueCurrency, estimatedIRR, comments, addressLine1, addressLine2, 
    city, state, country, postalCode, ownerFirstName, ownerLastName, 
    ownerMiddleName, ownerPhoneNumber, ownerEmail} = req.body;
  
   const raw =  JSON.stringify({
    recName: recName,
    recID: recID,
    assetType: assetType,
    bedRooms: bedRooms, 
    bathRooms: bathRooms,
    livingAreaSqft: livingAreaSqft,
    nonLivingAreaSqft: nonLivingAreaSqft,
    landSqft: landSqft, 
    yearBuilt: yearBuilt,
    asaID: asaID, 
    assetValue: assetValue, 
    assetValueCurrency: assetValueCurrency,
    estimatedIRR: estimatedIRR,   
    comments: comments, 
    addressLine1: addressLine1, 
    addressLine2: addressLine2, 
    city: city,   
    state: state,    
    country: country,      
    postalCode: postalCode,    
    ownerFirstName: ownerFirstName,  
    ownerLastName: ownerLastName,   
    ownerMiddleName: ownerMiddleName,  
    ownerPhoneNumber: ownerPhoneNumber,   
    ownerEmail: ownerEmail   
  })

  var myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  var requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: raw,
    redirect: 'follow'
  };
  
  fetch("https://api.globdrem.com/REC/CreateOpportunity", requestOptions)
    .then(response => response.text())
    .then(result => console.log(result))
    .catch(error => console.log('error', error));
  
  res.status(200).json("Success");
  
};
