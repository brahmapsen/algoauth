
  module.exports = async (req, res) => {
    console.log("GET REC1")
    
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    var requestOptions = {
    method: 'GET',
    headers: myHeaders,
    redirect: 'follow'
    };

    await fetch("https://api.globdrem.com/REC/GetAll", requestOptions)
        .then(response => response.text())
        .then(result => {
            console.log("Result:", result)
            res.status(200).json(result);
            }
        )
        .catch(error => console.log('Error:', error));

    //res.status(200).json("Success");
    
  };
  