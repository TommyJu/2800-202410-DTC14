const getChartOptions = () => {
  return {
    fill: {
      type: 'pattern',
      pattern: {
        style: 'horizontalLines',
        width: 6,
        height: 6,
        strokeWidth: 8,
      }
    },
    series: [levelGame, levelFitness, levelDiet],
    colors: ["#f5b700", "#f71735", "#62c370"],
    chart: {
      foreColor: '#f5b700',
      width: "100%",
      type: "donut",
    },
    stroke: {
      colors: ["#000000"],
      lineCap: "",
    },
    plotOptions: {
      pie: {
        donut: {
          labels: {
            show: true,
            name: {
              show: true,
              fontFamily: "Audiowide, sans-serif",
              offsetY: +30,
            },
            total: {
              showAlways: true,
              show: true,
              label: "GUD Level",
              fontSize: "20px",
              fontFamily: "Audiowide, sans-serif",
              formatter: function () {
                return levelDiet + levelFitness + levelGame;
              },
            },
            value: {
              show: true,
              fontSize: "60px",
              fontFamily: "Audiowide, sans-serif",
              offsetY: -20,
              formatter: function (value) {
                return value
              },
            },
          },
          size: "70%",
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
      fontFamily: "Audiowide, sans-serif",
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

