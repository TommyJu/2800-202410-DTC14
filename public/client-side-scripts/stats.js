const getChartOptions = () => {
  return {
    series: [levelGame, levelFitness, levelDiet],
    colors: ["#f5b700", "#f71735", "#62c370"],
    chart: {
      foreColor: '#ffffff',
      width: "100%",
      type: "donut",
    },
    stroke: {
      colors: ["#f7e1d7"],
      lineCap: "",
    },
    plotOptions: {
      pie: {
        donut: {
          labels: {
            show: true,
            name: {
              show: true,
              fontFamily: "Roboto, sans-serif",
              offsetY: +30,
            },
            total: {
              showAlways: true,
              show: true,
              label: "GUD Level",
              fontSize: "20px",
              fontFamily: "Roboto, sans-serif",
              formatter: function () {
                return levelDiet + levelFitness + levelGame;
              },
            },
            value: {
              show: true,
              fontSize: "60px",
              fontFamily: "Roboto, sans-serif",
              offsetY: -20,
              formatter: function (value) {
                return value
              },
            },
          },
          size: "90%",
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
      fontFamily: "Roboto, sans-serif",
      background: {
        foreColor: "#ffffff"
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
levelGame = parseInt(document.getElementById("levelGame").innerHTML);
levelFitness = parseInt(document.getElementById("levelFitness").innerHTML);
levelDiet = parseInt(document.getElementById("levelDiet").innerHTML);
if (document.getElementById("donut-chart") && typeof ApexCharts !== 'undefined') {
  const chart = new ApexCharts(document.getElementById("donut-chart"), getChartOptions());
  chart.render();
}

