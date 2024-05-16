const getChartOptions = () => {
  return {
    series: [5, 7, 10],
    colors: ["#1C64F2", "#FDBA8C", "#E74694"],
    chart: {
      width: "100%",
      type: "donut",
    },
    stroke: {
      colors: ["transparent"],
      lineCap: "",
    },
    plotOptions: {
      pie: {
        donut: {
          labels: {
            show: true,
            name: {
              show: true,
              fontFamily: "Inter, sans-serif",
              offsetY: +20,
            },
            total: {
              showAlways: true,
              show: true,
              label: "Combined Level",
              fontSize: "10px",
              fontFamily: "Inter, sans-serif",
              formatter: function (w) {
                const sum = w.globals.seriesTotals.reduce((a, b) => {
                  return a + b
                }, 0)
                return (sum / 3).toFixed(0)
              },
            },
            value: {
              show: true,
              fontSize: "50px",
              fontFamily: "Inter, sans-serif",
              offsetY: -10,
              formatter: function (value) {
                return value
              },
            },
          },
          size: "80%",
        },
      },
    },
    grid: {
      padding: {
        top: -2,
      },
    },
    labels: ["Game", "Fitness", "Diet"],
    dataLabels: {
      enabled: false,
    },
    legend: {
      position: "bottom",
      fontFamily: "Inter, sans-serif",
      background: {
        foreColor: "#fff"
      }
    },
    yaxis: {
      labels: {
        formatter: function (value) {
          return "LVL" + value
        },
      },
    },
    xaxis: {
      labels: {
        formatter: function (value) {
          return "LVL" + value
        },
      },
      axisTicks: {
        show: false,
      },
      axisBorder: {
        show: false,
      },
    },
  }
}
if (document.getElementById("donut-chart") && typeof ApexCharts !== 'undefined') {
  const chart = new ApexCharts(document.getElementById("donut-chart"), getChartOptions());
  chart.render();
}
