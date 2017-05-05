import React from 'react';

export default function SectionHeader({ subtitle, children }) {
  return (
    <div className="sh sh--y">
      <h1 className="sh-title">{children}</h1>
      { subtitle && <div className="sh-contact">{subtitle}</div> }
    </div>
  );
}
