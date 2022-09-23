const axios = require("axios").default;
const SendPost = async () => {
  let response = await axios.post("http://localhost:8080/hello", {
    ISBN: "9789577627124",
  });

  console.log(response.data);
};

SendPost();
