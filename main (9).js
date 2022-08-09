
(function() {
  'use strict';
  moment.locale('en');
  
  var highlightedTableCells = function(table){
     var tableCellsToHighlight = [];
     var rows = table.value;
     var tableElement = document.querySelector('tbody').children;
     rows.forEach(function(row, index){
       var currentSharesInPosition = row.value.sharesInPosition.value;
       var previousSharesInPosition = rows[index - 1] ? rows[index - 1].value.sharesInPosition.value : 0;
      // console.log(tableElement[index], index)
       var cell = tableElement[index].children[5].querySelector('input')
       if (Number(currentSharesInPosition) < Number(previousSharesInPosition)){
            cell.style.backgroundColor = '#008000'; //green
            cell.style.color = 'white';
         } else {
           cell.style.backgroundColor = 'rgb(255, 255, 255)';
           cell.style.color = '#333';
         }
     })
     return;
   }
  
  var highlightCellsOnShow = function(table){
    var tableCellsToHighlight = [];
    var rows = table.value;
    var tableElement = kintone.app.record.getFieldElement('Table_2').querySelector('tbody')
    setTimeout(function(){
      var rowElement = tableElement.children;
      rows.forEach(function(row, index){
        var currentSharesInPosition = row.value.sharesInPosition.value;
        var previousSharesInPosition = rows[index - 1] ? rows[index - 1].value.sharesInPosition.value : 0;
        var cell = rowElement[index].children[5].querySelector('div');
        var span = rowElement[index].children[5].querySelector('span');
        if (Number(currentSharesInPosition) < Number(previousSharesInPosition)){
              cell.style.backgroundColor = '#008000'; //green
              span.style.color = 'white';
        } else {
            cell.style.backgroundColor = '#f5f5f5';
            span.style.color = '#333';
        }
      })
    },4000)
    
  }
  
  
  
  
  kintone.events.on(['app.record.create.show', 'app.record.edit.show','app.record.detail.show', 'app.record.create.change.symbol', 'app.record.edit.change.symbol' ], function(event) {
   
   var record = event.record;

 //code to add a chart here:
    var symbol = event.record.symbol.value;
    var chartSpaceElement = kintone.app.record.getSpaceElement('chart');
    chartSpaceElement.innerHTML = ""
    var chart = document.createElement('div');
    chart.innerHTML = `<div class="tradingview-widget-container"><div id="tradingview_58cad"></div><div class="tradingview-widget-copyright"><a href="https://www.tradingview.com/symbols/NASDAQ-AAPL/" rel="noopener" target="_blank"><span class="blue-text">Maxim Chart</span></a> by Masken Solutions</div></div>`
    chartSpaceElement.appendChild(chart);

    new TradingView.widget(
      {
      "width": 980,
      "height": 610,
      "symbol": `${symbol}`,
      // "interval": "D",
      "timezone": "Etc/UTC",
      "theme": "light",
      "style": "1",
      "locale": "en",
      "toolbar_bg": "#f1f3f6",
      "enable_publishing": false,
      "withdateranges": true,
      "range": "6m",
      "hide_side_toolbar": false,
      "allow_symbol_change": true,
      "details": true,
      "news": [
        "headlines"
        ],
      "container_id": "tradingview_58cad"
    }
  );
    
 
 // stock price calculations code below

   if (event.type === "app.record.create.show" || event.type === "app.record.edit.show") {
   var buttonElement = document.createElement('button');
   buttonElement.id = "calculateButton";
   buttonElement.innerText = 'Calculate';

   //replace button element with blank space
   kintone.app.record.getSpaceElement('button').appendChild(buttonElement);

   //add eventlistener to button
   buttonElement.addEventListener('click', function(e){
     var recordData = kintone.app.record.get();
     var record = recordData.record;
     var rebalancingRate = record.rebalancingRate.value;
     var startDate = new Date(record.startDate.value);
    // var dayOfWeek = startDate.getDay();
    //   //if not Monday, move date back
    //   while (dayOfWeek !== 1) {
    //       var dateMilliseconds = startDate.getTime();
    //       dateMilliseconds -= 86400000;
    //       startDate = new Date(dateMilliseconds);
    //       dayOfWeek = startDate.getDay();
    //   }

    var endDate = new Date (record.endDate.value);
    // var startFormatted = startDate.getFullYear() + '-' + (startDate.getMonth() + 1) + "-" + startDate.getDate()
    // var endFormatted = moment(endDate).format(record.endDate.value, "YYYY-MM-DD")
    // console.log(startFormatted, endFormatted)
    var startSecs = startDate.getTime() / 1000;
    var endSecs = endDate.getTime() / 1000;
    var frequencies = {
          'Daily': '1d',
          'Weekly': '1wk',
          'Monthly': '1mo',
    }
    // var frequency = {
    //       'Daily': 'daily',
    //       'Weekly': 'weekly',
    //       'Monthly': 'monthly',
    // }
    var symbol = record.symbol.value;
    // var urlTriingo = `https://api.tiingo.com/tiingo/daily/${symbol}/prices?token=e7c26f17aa5915a9f5126b5094fe6742b3a29f43&startDate=${startFormatted}&endDate=${endFormatted}&&resampleFreq=${frequency[rebalancingRate]}`;
    var url = `https://apidojo-yahoo-finance-v1.p.rapidapi.com/stock/v2/get-historical-data?frequency=${frequencies[rebalancingRate]}&filter=history&period1=${startSecs}&period2=${endSecs}&symbol=${symbol}`
    var urlNews = `https://apidojo-yahoo-finance-v1.p.rapidapi.com/stock/get-news?region=US&category=${symbol}`
    var urlChart = `https://apidojo-yahoo-finance-v1.p.rapidapi.com/stock/v2/get-chart?interval=5m&region=US&symbol=${symbol}&lang=en&range=1wk`
    // var urlNewsTriingo = `https://api.tiingo.com/tiingo/news?token=e7c26f17aa5915a9f5126b5094fe6742b3a29f43&tickers=${symbol}`;
    var method = 'GET'
    var headers = {
        'x-rapidapi-host': 'apidojo-yahoo-finance-v1.p.rapidapi.com',
        'x-rapidapi-key': '554ea15947msh86b9cacf287c2a0p1bf57ejsnf94ac884003a'
    }
    // var headersTriingo = {
    //     'Content-Type': 'application/json'
    // }
    // console.log(urlChart)
    var callback = function(response) {
        //upate the table with stock price data
        var data = JSON.parse(response).prices;
        // console.log(data ,'data');
        var recordData = kintone.app.record.get();
        var rec = recordData.record;
        var frequency = rec.rebalancingRate.value;
        // rec['Table_2'] = updateTable(data, rec);
        // if(!rec['Table_2']) return;
        // kintone.app.record.set(recordData);
        // return;
        var results = updateTable(data, rec, frequency);
        rec['Table_2'] = results.table;
        if(!rec['Table_2']) return;
        var rows = rec['Table_2'].value;
        rec['cpr'].value = rows[rows.length - 1].value.cumValCash.value;
        rec['bh'].value = rows[0].value.sharesInPosition.value * rows[rows.length - 1].value.current_price.value;
        rec['maxDraw'].value = Number(results.lowestCumCashAct);
        kintone.app.record.set(recordData);
        
        highlightedTableCells(rec['Table_2']);
        //color the table cells that have less sharesInPosition in green
        //var table = document.querySelector('tbody').children;
        // tableCellsToHighlight.forEach(function(row){
        //   var tableCell = table[row].children[5].querySelector('input')
        //   tableCell.style.backgroundColor = '#008000'; //green
        //   tableCell.style.color = 'white';
        // })
        return;
    };
      
      // var callbackTriingo = function (response) {
      //   //upate the table with stock price data
      //   var data = JSON.parse(response);
      //   console.log(data ,'data');
      //   var recordData = kintone.app.record.get();
      //   var rec = recordData.record;
        
      //   //get both table results and the rows to highlight cells in green
      //   var results = updateTableTriingo(data, rec);
      //   rec['Table_2'] = results.table;
      //   if(!rec['Table_2']) return;
      //   var highlightedCells = results.highlightedCells;
      //   var rows = rec['Table_2'].value;
      //   rec['cpr'].value = rows[rows.length - 1].value.cumValCash.value;
      //   rec['bh'].value = rows[0].value.sharesInPosition.value * rows[rows.length - 1].value.current_price.value;
      //   kintone.app.record.set(recordData);
        
      //   //color the table cells that have less sharesInPosition in green
      //   var table = document.querySelector('tbody').children;
      //   highlightedCells.forEach(function(row){
      //     var tableCell = table[row].children[5].querySelector('input')
      //     tableCell.style.backgroundColor = '#008000'; //green
      //     tableCell.style.color = 'white';
      //   })
      //   return;
      // }
      
    var errback = function(err) {
          console.log(err);
    };
    
     var testCallback = function(response) {
        var parsedData = JSON.parse(response);
        var recordData = kintone.app.record.get();
        var rec = recordData.record;
        if(!parsedData) return;
        rec.news.value = parsedData.items.result[3].summary;
        kintone.app.record.set(recordData);
        return;
      };
      
      var chartCallback = function(response) {
        var parsedData = JSON.parse(response);
        var recordData = kintone.app.record.get();
        var rec = recordData.record;
        if(!parsedData) return;
        // console.log(parsedData)
        // rec.chart.value = parsedData.items;
        // kintone.app.record.set(recordData);
        return;
      };
     
		console.log(urlChart);
      
    // kintone.proxy(urlTriingo, method, headersTriingo, '', callbackTriingo, errback);
    kintone.proxy(url, method, headers, '', callback, errback);
    // kintone.proxy(urlNewsTriingo, method, headers, '', testCallback, errback);
    kintone.proxy(urlNews, method, headers, '', testCallback, errback);
    kintone.proxy(urlChart, method, headers, '', chartCallback, errback);

  // function updateTableTriingo(data, record){
  //       var newTable = {
  //           type: "SUBTABLE",
  //           value: []
  //       }
  //       var investment = record.investment.value; //100000
  //       var sharesInPosition = 0
  //       var valuePosition = investment;  //100000
  //       var adjustmentValue = 0;
  //       var shareAdjustment = 0;
  //       var valueCashAct = 0;
  //       var stockPrice = 0;
  //       var tableCellsToHighlight = [];
    
  //       //iteratation of stock prices 
  //       if (!data) return;
  //       for(var i = 0; i < data.length; i++){
  //           var stockInfo = data[i];
  //           if (!stockInfo) break;
  //           var dateUnformatted = stockInfo.date;
  //           var date = dateUnformatted.split('T', 1).join('');
  //           var price = stockInfo.open; //4.00
  //           var priceHigh = stockInfo.high ? stockInfo.high : 0;
  //           var priceLow = stockInfo.low ? stockInfo.low : 0;
  //           var priceClose = stockInfo.close ? stockInfo.close : 0;
  //           if (price){
  //             if(newTable.value.length === 0){
  //             //set calculations
  //             sharesInPosition = Math.round(investment / price);  //23640
  //             stockPrice = Math.round((price + Number.EPSILON) * 100) / 100; //3.50
  //             valueCashAct = Number(investment);
  //           } else {
  //             //set calculations
  //             valuePosition = Math.round(sharesInPosition * price);
  //             adjustmentValue = Math.round(Math.abs(valuePosition - investment));
  //             shareAdjustment = Math.round(adjustmentValue / price);
  //             if((price - stockPrice) < 0 ){
  //               sharesInPosition = Math.round(sharesInPosition + shareAdjustment);
  //             } else {
  //               tableCellsToHighlight.push(i);
  //               sharesInPosition = Math.round(sharesInPosition - shareAdjustment);
  //             }
  //             // sharesInPosition = Math.round((price - stockPrice) < 0 ? (sharesInPosition + shareAdjustment) : sharesInPosition - shareAdjustment);
  //             valueCashAct = Math.round((price - stockPrice) > 0 ? (valueCashAct + adjustmentValue) : valueCashAct - adjustmentValue);
  //             stockPrice = price;
  //           }
  //           var tableRow = {
  //               value: {
  //               Date_1: {type: "DATE", value: date},
  //               current_price: {type: "NUMBER", value:price},
  //               priceHigh: {type: "NUMBER", value:priceHigh},
  //               priceLow: {type: "NUMBER", value:priceLow},
  //               priceClose: {type: "NUMBER", value:priceClose},
  //               sharesInPosition: {type: "NUMBER", value: sharesInPosition},
  //               positionVal: {type: "NUMBER", value: valuePosition},
  //               adjustmentValue: {type: "NUMBER", value: adjustmentValue},
  //               shareAdjustment: {type: "NUMBER", value: shareAdjustment},
  //               cumValCash: {type: "NUMBER", value: valueCashAct},
               
  //               }
  //           }
  //           newTable.value.push(tableRow);
  //           }
            
  //       }
  //       return {table: newTable, highlightedCells: tableCellsToHighlight};
  //   }


    function updateTable(data, record, frequency){
        var newTable = {
            type: "SUBTABLE",
            value: []
        }
        var investment = record.investment.value; //100000
        var sharesInPosition = 0
        var valuePosition = investment;  //100000
        var adjustmentValue = 0;
        var shareAdjustment = 0;
        var valueCashAct = 0;
        var stockPrice = 0;
        var tableCellsToHighlight = [];
        var lowestCumCashAct = Infinity;
        var convertDate = function(epoch) {
    
          // if(frequency !== "Weekly"){
          //   epoch  += 
          // }
              if(epoch < 10000000000) {
                epoch *= 1000;
                var epochFormatted = epoch + (new Date().getTimezoneOffset() * -1); 
                // console.log(epochFormatted);
                return moment.utc(epochFormatted).format("YYYY-MM-DD");
              }
            }
        //iteratation of stock prices 
        if (!data) return;
        for(var i = data.length - 1; i >= 0 ; i--){
            var stockInfo = data[i];
            if (!stockInfo) break;
            
            var date = convertDate(stockInfo.date);
            // console.log(stockInfo.date, date)
            var price = stockInfo.open; //4.00
            var priceHigh = stockInfo.high ? stockInfo.high : 0;
            var priceLow = stockInfo.low ? stockInfo.low : 0;
            var priceClose = stockInfo.close ? stockInfo.close : 0;
            var prevCumValCash;
        
            if (price){
              
              if(newTable.value.length === 0){
              //set calculations
              sharesInPosition = Math.round(investment / price);  //23640
              stockPrice = Math.round((price + Number.EPSILON) * 100) / 100; //3.50
              valueCashAct = Number(investment);
              
            } else {
              //set calculations
              prevCumValCash = valueCashAct;
              valuePosition = Math.round(sharesInPosition * price);
              adjustmentValue = Math.round(Math.abs(valuePosition - investment));
              shareAdjustment = Math.round(adjustmentValue / price);
              sharesInPosition = Math.round((price - stockPrice) < 0 ? (sharesInPosition + shareAdjustment) : sharesInPosition - shareAdjustment);
              valueCashAct = Math.round((price - stockPrice) > 0 ? (valueCashAct + adjustmentValue) : valueCashAct - adjustmentValue);
              stockPrice = price;
              
            }
            lowestCumCashAct = Math.min(lowestCumCashAct, valueCashAct);
            var tableRow = {
                value: {
                Date_1: {type: "DATE", value: date},
                current_price: {type: "NUMBER", value:price},
                priceHigh: {type: "NUMBER", value:priceHigh},
                priceLow: {type: "NUMBER", value:priceLow},
                priceClose: {type: "NUMBER", value:priceClose},
                sharesInPosition: {type: "NUMBER", value: sharesInPosition},
                positionVal: {type: "NUMBER", value: valuePosition},
                adjustmentValue: {type: "NUMBER", value: adjustmentValue},
                shareAdjustment: {type: "NUMBER", value: shareAdjustment},
                cumValCash: {type: "NUMBER", value: valueCashAct},
               
                }
            }
            // console.log(tableRow)
            newTable.value.push(tableRow);
            }
            
        }
         lowestCumCashAct = lowestCumCashAct === Infinity ? 0 : lowestCumCashAct
         return {table: newTable, lowestCumCashAct: lowestCumCashAct};
    }

    return e;
   })
  }
  if(event.type === 'app.record.detail.show') {
    // document.addEventListener('DOMContentLoaded', function(e){
       highlightCellsOnShow(record['Table_2'])
    // })
    // setTimeout(highlightCellsOnShow(record['Table_2']), 0);
  } else if(event.type === 'app.record.edit.show' || event.type === 'app.record.create.show'){
      highlightedTableCells(record['Table_2'])
  }
  kintone.app.record.setFieldShown('maxDraw', false);
   
  
  });
})();





