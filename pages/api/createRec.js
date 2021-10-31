import axios from "axios"; // axios requests


module.exports = async (req, res) => {
  console.log("call REC1")
  const { orgName,orgTaxID,orgPhoneNumber,addressLine1,addressLine2,city,state,country,postalCode,contactFirstName,contactLastName,contactMiddleName,contactPhoneNumber,contactEmail} = req.body;
  
   const raw =  JSON.stringify({
    orgName: orgName,
    orgTaxID: orgTaxID,
    orgPhoneNumber: orgPhoneNumber,
    addressLine1: addressLine1,
    addressLine2: addressLine2,
    city: city,
    state: state,
    country: country,
    postalCode: postalCode,
    contactFirstName: contactFirstName,
    contactLastName: contactLastName,
    contactMiddleName: contactMiddleName,
    contactPhoneNumber: contactPhoneNumber,
    contactEmail: contactEmail
  })
  
  // const config = {
  //   method: "post",
  //   url: "https://api.globdrem.com/REC/Register",
  //   body: raw,
  //   headers: { 
  //     'Content-Type': 'application/json',
  //   }
  // }
  // let _res = await axios(config)
  // console.log(_res.data);
  // res.status(200).json(_res.data);


  var myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  var requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: raw,
    redirect: 'follow'
  };
  
  fetch("https://api.globdrem.com/REC/Register", requestOptions)
    .then(response => response.text())
    .then(result => console.log(result))
    .catch(error => console.log('error', error));
  
  res.status(200).json("Success");
  
};
