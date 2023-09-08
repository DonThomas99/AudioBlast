
const sale = document.getElementById('month').value;
 var monthSale = JSON.parse(sale)
//  console.log(monthSale);
let Year = monthSale[0].year
let data =[]
for(let i = 0; i <=12; i++){
  for(let j = 0; j < monthSale.length; j++){
      if((monthSale[j].month-1 )== i){
        data[i] = monthSale[j].monthlySales
        break
      }
    }

    if(!data[i]){
      data[i] =0
    }
}
console.log(data);

var options = {
    series: [{
    name: 'Sale',
    data: data
  }],
    chart: {
    height: 350,
    type: 'bar',
  },
  plotOptions: {
    bar: {
      borderRadius: 10,
      dataLabels: {
        position: 'top', // top, center, bottom
      },
    }
  },
  dataLabels: {
    enabled: true,
    formatter: function (val) {
      return val  ;
    },
    offsetY: -20,
    style: {
      fontSize: '12px',
      colors: ["#304758"]
    }
  },
  
  xaxis: {
    categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    position: 'top',
    axisBorder: {
      show: true
    },
    axisTicks: {
      show: true
    },
    crosshairs: {
      fill: {
        type: 'gradient',
        gradient: {
          colorFrom: '#D8E3F0',
          colorTo: '#BED1E6',
          stops: [0, 100],
          opacityFrom: 0.4,
          opacityTo: 0.5,
        }
      }
    },
    tooltip: {
      enabled: true,
    }
  },
  yaxis: {
    axisBorder: {
      show:true,
    },
    axisTicks: {
      show:true,
    },
    labels: {
      show: false,
      formatter: function (val) {
        return '₹'+val ;
      }
    }
  
  },
  title: {
    text: `Monthly Sales, ${Year}`,
    floating: true,
    offsetY: 330,
    align: 'center',
    style: {
      color: '#444'
    }
  }
  };

  var chart = new ApexCharts(document.querySelector("#chart"), options);
  chart.render();
// var options = {
//    series: [{
//    name: 'Sale',
//    data: data
//  }],
//    chart: {
//    height: 350,
//    type: 'pie',
//  },
//  plotOptions: {
//    bar: {
//      borderRadius: 10,
//      dataLabels: {
//        position: 'top', // top, center, bottom
//      },
//    }
//  },
//  dataLabels: {
//    enabled: true,
//    formatter: function (val) {
//      return val  ;
//    },
//    offsetY: -20,
//    style: {
//      fontSize: '12px',
//      colors: ["#304758"]
//    }
//  },
 
//  xaxis: {
//    categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
//    position: 'top',
//    axisBorder: {
//      show: true
//    },
//    axisTicks: {
//      show: true
//    },
//    crosshairs: {
//      fill: {
//        type: 'gradient',
//        gradient: {
//          colorFrom: '#D8E3F0',
//          colorTo: '#BED1E6',
//          stops: [0, 100],
//          opacityFrom: 0.4,
//          opacityTo: 0.5,
//        }
//      }
//    },
//    tooltip: {
//      enabled: true,
//    }
//  },
//  yaxis: {
//    axisBorder: {
//      show:true,
//    },
//    axisTicks: {
//      show:true,
//    },
//    labels: {
//      show: false,
//      formatter: function (val) {
//        return val ;
//      }
//    }
 
//  },
//  title: {
//    text: `Monthly Sales, ${Year}`,
//    floating: true,
//    offsetY: 330,
//    align: 'center',
//    style: {
//      color: '#444'
//    }
//  }
//  };

//  var Piechart = new ApexCharts(document.querySelector("#chart"), options);
//  Piechart.render();
