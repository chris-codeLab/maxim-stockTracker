// (function() {
//   'use strict';
//   kintone.events.on('app.record.detail.show', function(event) {
//     var record = event.record;
//     var symbol = record.symbol.value;
//       //make chartGraph
//     var chartSpaceElement = kintone.app.record.getSpaceElement('chart');
//     var chart = document.createElement('div');
//     chart.innerHTML = `<div class="tradingview-widget-container"><div id="tradingview_58cad"></div><div class="tradingview-widget-copyright"><a href="https://www.tradingview.com/symbols/NASDAQ-AAPL/" rel="noopener" target="_blank"><span class="blue-text">AAPL Chart</span></a> by TradingView</div></div>`
//     chartSpaceElement.appendChild(chart);

//     new TradingView.widget(
//   {
//   "width": 980,
//   "height": 610,
//   "symbol": `NASDAQ:${symbol}`,
//   // "interval": "D",
//   "timezone": "Etc/UTC",
//   "theme": "light",
//   "style": "1",
//   "locale": "en",
//   "toolbar_bg": "#f1f3f6",
//   "enable_publishing": false,
//   "allow_symbol_change": true,
//   "container_id": "tradingview_58cad"
// }
//   );
    
    
    
//   });
// })();
