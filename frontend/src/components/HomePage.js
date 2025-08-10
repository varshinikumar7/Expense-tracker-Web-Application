import { useEffect, useState } from "react";
import axios from "axios";

export default function HomePage() {
  const [category, setCategory] = useState("Food");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [total, setTotal] = useState(0);

  const year = new Date().getFullYear();
  const month = new Date().getMonth() + 1;

  const fetchTotal = async () => {
    const res = await axios.get(`http://localhost:5000/total/${year}/${month}`);
    setTotal(res.data.total || 0);
  };

  const addExpense = async () => {
    await axios.post("http://localhost:5000/expenses", { category, amount, date });
    fetchTotal();
    setAmount("");
    setDate("");
  };

  useEffect(() => {
    fetchTotal();
  }, []);

  return (
    <div
      className="min-h-screen bg-cover bg-center"
      style={{
        backgroundImage: "url('/10061977.jpg')",
      }}
    >
      {/* Heading at the very top */}
      <h1 className="text-5xl font-bold text-white drop-shadow-lg text-center pt-8">
        Expense Tracker
      </h1>

      {/* Content in center */}
      <div className="flex items-center justify-center mt-10">
        <div className="p-6 max-w-lg w-full bg-white rounded-xl shadow-lg">
          <h1 className="text-2xl font-bold text-center">
            Monthly Total: ₹{total}
          </h1>

          <div className="mt-6 space-y-4">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="border rounded p-2 w-full"
            >
              <option>Food</option>
              <option>Transport</option>
              <option>Entertainment</option>
              <option>Bills</option>
              <option>Groceries</option>
            </select>

            <input
              type="number"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="border rounded p-2 w-full"
            />

            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="border rounded p-2 w-full"
            />

            <button
              onClick={addExpense}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded w-full"
            >
              Add Expense
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
