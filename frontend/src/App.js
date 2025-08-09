import React from 'react';
import MonthlySpendingChart from './components/MonthlySpendingChart';
import CategoryPieChart from './components/CategoryPieChart';
import ExpenseTable from './components/ExpenseTable';

function App(){
  return (
    <div style={{padding:20}}>
      <h1>Expense Analytics Dashboard</h1>
      <div style={{display:'flex', gap:20}}>
        <div style={{flex:1}}><MonthlySpendingChart/></div>
        <div style={{flex:1}}><CategoryPieChart/></div>
      </div>
      <div style={{marginTop:20}}><ExpenseTable/></div>
    </div>
  );
}
export default App;
