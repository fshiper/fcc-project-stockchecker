const axios = require('axios');


const priceCheck = async (stock) => {
  const stockProxy = 'https://repeated-alpaca.glitch.me/v1/stock/'
  try {
    return await axios.get(stockProxy+`${stock}/quote`)  
  } catch (error) {
    return error
  }
}

module.exports = priceCheck;
