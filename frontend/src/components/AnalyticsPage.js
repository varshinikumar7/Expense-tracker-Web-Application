import { useEffect, useState } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function AnalyticsPage() {
  const [summary, setSummary] = useState([]);
  const [topCategory, setTopCategory] = useState({});
  const [monthlyTotal, setMonthlyTotal] = useState(0); // ⬅ NEW STATE
  const year = new Date().getFullYear();
  const month = new Date().getMonth() + 1;

  useEffect(() => {
    const fetchData = async () => {
      const sumRes = await axios.get(`http://localhost:5000/summary/${year}/${month}`);
      setSummary(sumRes.data);

      const topRes = await axios.get(`http://localhost:5000/top-category/${year}/${month}`);
      setTopCategory(topRes.data);

      // ⬅ Fetch Monthly Total Expense
      const totalRes = await axios.get(`http://localhost:5000/monthly-total/${year}/${month}`);
      setMonthlyTotal(totalRes.data.total || 0);
    };
    fetchData();
  }, []);

  const data = {
    labels: summary.map(s => s.category),
    datasets: [
      {
        label: "Amount Spent",
        data: summary.map(s => s.total),
        backgroundColor: "rgba(75, 192, 192, 0.6)"
      }
    ]
  };

  return (
    <div className="p-10 max-w-4xl mx-auto bg-white rounded-xl shadow-lg m-10">
      <h1 className="text-2xl font-bold mb-6">Analytics</h1>

      {/* Monthly Total Card */}
      <div className="mb-6 p-6 bg-gradient-to-r from-green-400 to-green-600 text-white rounded-xl shadow-lg">
        <h2 className="text-xl font-semibold">Total Expense - {new Date().toLocaleString("default", { month: "long", year: "numeric" })}</h2>
        <p className="text-4xl font-bold mt-2">₹{monthlyTotal.toLocaleString()}</p>
      </div>

      {/* Category-wise Bar Chart */}
      <div className="mb-6">
        <Bar data={data} />
      </div>

      {/* Top Category */}
      <h2 className="text-lg font-semibold">
        Most Spent Category: {topCategory.category} (₹{topCategory.total})
      </h2>
    </div>
  );
}
