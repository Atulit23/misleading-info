const axios = require("axios")

axios.post('http://localhost:3000/compareDescriptions', {amazonUrl: 'https://www.amazon.in/Samsung-inches-Crystal-iSmart-UA43CUE60AKLXL/dp/B0C1GX5RVW/ref=sr_1_1'}).then(res => {
  console.log(res.data)
}).catch(err => {
  console.log(err)
})