import React from 'react';

const MasonryLayout = ({ children }) => {
  return (
    <div className="masonry-grid">
      {children}
    </div>
  );
};

export default MasonryLayout;
