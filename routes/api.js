/*
 *
 *
 *       Complete the API routing below
 *
 *
 */

"use strict";

var expect = require("chai").expect;
const mongoose = require("mongoose");
const Stock = require("../models/stock");
const priceCheck = require("../api/stockChecker");


const saveStockToDB = async(stock) => {
  try {
    return await stock.save()
  } catch (e) {
    console.log(e)
  }
}
const findStock = async stock => {
  return await Stock.findOne(stock).exec();
};

const queryStockData = async (stockName, like, ip) => {
  try {
    let stockFromDB = await findStock({ stock: stockName.toUpperCase() });
    let stockFromApi = await priceCheck(stockName.toUpperCase());
    if (!stockFromApi) return {error: "stock does not exists"}
    if (!stockFromDB) {
      stockFromDB = new Stock({
        stock: stockFromApi.data.symbol,
        price: stockFromApi.data.latestPrice,
        likes: []
      })
    } else {
      stockFromDB.price = stockFromApi.data.latestPrice
    }
    if (!stockFromDB.likes.some(a=>a===ip) && like) {
      stockFromDB.likes.push(ip)
    }
    const updatedStock = await saveStockToDB(stockFromDB)
    return updatedStock;
  } catch (err) {
    return err;
  }
};

const checkBothStocks = async (stocks, like, ip) => {
  const stockData = []
  try {
    const firstStock = await queryStockData(stocks[0], like, ip)
    const secondStock = await queryStockData(stocks[1], like, ip)
    stockData.push(firstStock)
    stockData.push(secondStock)
    return stockData
  } catch (err) {
    return err
  }
}
module.exports = app => {
  app.route("/api/stock-prices").get((req, res) => {
    let ip = (
      req.headers["x-forwarded-for"] ||
      req.connection.remoteAddress ||
      ""
    )
      .split(",")[0]
      .trim();
    let stockName = req.query.stock;
    let stockLike = req.query.like;
    let response = {}
    //if single stock querried
    if (!Array.isArray(stockName)) {
      queryStockData(stockName, stockLike, ip)
        .then(stock => {
          response.stockData = {
            stock: stock.stock,
            price: stock.price,
            likes: stock.likes.length
          }
          res.status(200).json(response)
        })
        .catch(err => {
          response = err
        });
    } else {
      checkBothStocks(stockName, stockLike, ip)
        .then(stocks => {
          response.stockData=[
            {
              stock: stocks[0].stock,  
              price: stocks[0].price,
              rel_likes: stocks[0].likes.length-stocks[1].likes.length
            },
            {
              stock: stocks[1].stock,  
              price: stocks[1].price,
              rel_likes: stocks[1].likes.length-stocks[0].likes.length
            }
          ]
          res.json(response)
      })
    }
  });
};
