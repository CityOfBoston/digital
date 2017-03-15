import React from 'react';

export default function SectionHeader({ children }) {
  return (
    <div className="sh sh--y">
      <h2 className="sh-title">{children}</h2>
    </div>
  );
}
