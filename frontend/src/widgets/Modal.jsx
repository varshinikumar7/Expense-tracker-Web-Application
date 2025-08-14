import React from "react";
export default function Modal({ title, children, onClose }){
  return (
    <div className="fixed inset-0 bg-black/50 grid place-items-center p-4 z-50" onClick={onClose}>
      <div className="card w-full max-w-lg" onClick={e=>e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xl font-semibold">{title}</h3>
          <button className="px-3 py-1 rounded-xl bg-slate-700 hover:bg-slate-700" onClick={onClose}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}