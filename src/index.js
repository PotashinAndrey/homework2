import "babel-polyfill";
import Chart from "chart.js";

const meteoURL = "/xml.meteoservice.ru/export/gismeteo/point/140.xml";

async function loadTemperature() {
  const response = await fetch(meteoURL);
  const xmlTest = await response.text();
  const parser = new DOMParser();
  const weatherData = parser.parseFromString(xmlTest, "text/xml");
  const time = weatherData.querySelectorAll("FORECAST");
  const tempRange = weatherData.querySelectorAll("TEMPERATURE");
  const timeDt = [];
  const weatherDataMax = [];
  const weatherDataMin = [];
  for (let i = 0; i < time.length; i++) {
    const Tag = time.item(i);
    const day = Tag.getAttribute("day");
    const month = Tag.getAttribute("month");
    timeDt[i] = String(day) + '.' + String(month);
  }
  for (let i = 0; i < tempRange.length; i++) {
    const Tag = tempRange.item(i);
    const minimum = Tag.getAttribute("min");
    const maximum = Tag.getAttribute("max");
    weatherDataMax[i] = maximum;
    weatherDataMin[i] = minimum;
  }
  return { time: timeDt, temperature: { max: weatherDataMax, min: weatherDataMin } };
}

const buttonBuild = document.getElementById("btn");
const canvasCtx = document.getElementById("out").getContext("2d");
buttonBuild.addEventListener("click", async function () {
  const currencyData = await loadTemperature();

  const chartConfig = {
    type: "line",

    data: {
      labels: currencyData.time,
      datasets: [
        {
          label: "Минимальная темпиратура",
          borderColor: "rgb(200, 0, 0)",
          backgroundColor: "rgb(200, 0, 0, 0.05)",
          data: currencyData.temperature.min
        },
        {
          label: "Максимальная темпиратура",
          borderColor: "rgb(0, 200, 0)",
          backgroundColor: "rgb(0, 200, 0, 0.05)",
          data: currencyData.temperature.max
        }
      ]
    },
    options: {
      scales: {
        yAxes: [{
          ticks: {
            min: Math.min(...currencyData.temperature.min) - delta(currencyData.temperature.min),
            max: Math.max(...currencyData.temperature.max) + delta(currencyData.temperature.min)
          }
        }]
      }
    }
  };

  if (window.chart) {
    window.chart.data.labels = chartConfig.data.labels;
    window.chart.data.datasets[0].data = chartConfig.data.datasets[0].data;
    window.chart.update({
      duration: 800,
      easing: "easeOutBounce"
    });
  } else {
    window.chart = new Chart(canvasCtx, chartConfig);
  }
});

function delta(array) {
  return Math.max(Math.abs(Math.min(...array)), Math.max(...array))/5;
}
