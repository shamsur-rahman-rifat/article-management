// src/components/Sidebar.jsx
import React from 'react';

export default function Sidebar({ children }) {
  return (
    <div className="d-flex">
      <aside className="p-3" style={{ minWidth: 220, borderRight: '1px solid #eee' }}>
        {/* put role-specific links here if needed */}
        <div><strong>Menu</strong></div>
      </aside>
      <main className="flex-grow-1 p-3">{children}</main>
    </div>
  );
}


