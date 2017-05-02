import React from 'react';

export default function SectionHeader({ subtitle, children }) {
  return (
    <div className="sh sh--y">
      <h2 className="sh-title">{children}</h2>
      { subtitle && <div className="sh-contact">{subtitle}</div> }
    </div>
  );
}
