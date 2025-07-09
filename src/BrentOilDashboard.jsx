import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function BrentOilDashboard() {
  const [oilData, setOilData] = useState([]);
  const [forecast, setForecast] = useState([]);
  const [lastWeekPrice, setLastWeekPrice] = useState(null);
  const [currentPrice, setCurrentPrice] = useState(null);

  useEffect(() => {
    fetchOilData();
  }, []);

  const fetchOilData = async () => {
    try {
      const response = await fetch("./brent-data.json");
      const data = await response.json();

      const prices = data.slice(-30); // letzte 30 Tage

      setOilData(prices);
      setCurrentPrice(prices.at(-1)?.price || null);
      setLastWeekPrice(prices.at(-8)?.price || null);

      // Dummy 5-Tages-Prognose
      const forecastData = Array.from({ length: 5 }).map((_, i) => {
        const last = prices.at(-1)?.price || 80;
        return {
          date: new Date(Date.now() + (i + 1) * 86400000).toISOString().slice(0, 10),
          price: parseFloat((last + (i + 1) * 0.3).toFixed(2)),
        };
      });
      setForecast(forecastData);
    } catch (error) {
      console.error("Fehler beim Laden der JSON-Datei:", error);
    }
  };

  const chartData = {
    labels: [...oilData.map((e) => e.date), ...forecast.map((f) => f.date)],
    datasets: [
      {
        label: "Brent (real)",
        data: oilData.map((e) => e.price),
        borderColor: "#007bff",
        tension: 0.3,
      },
      {
        label: "Prognose (5 Tage)",
        data: [...Array(oilData.length).fill(null), ...forecast.map((f) => f.price)],
        borderColor: "#ff5733",
        borderDash: [5, 5],
        tension: 0.3,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: "Brent Ölpreis – Verlauf & Prognose" },
    },
  };

  const diff = currentPrice && lastWeekPrice ? (currentPrice - lastWeekPrice).toFixed(2) : null;
  const trend = diff ? `${diff > 0 ? "+" : ""}${diff} USD zur Vorwoche` : "Lade...";

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Tägliches Brent-Öl Dashboard</h1>
      <p className="mb-2">Aktueller Preis: {currentPrice ? `${currentPrice} USD` : "Lade..."}</p>
      <p className="mb-4">{trend}</p>
      <Line data={chartData} options={chartOptions} />
    </div>
  );
}
