
import React from 'react';

interface MainContentProps {
  children: React.ReactNode;
}

const MainContent: React.FC<MainContentProps> = ({ children }) => {
  return (
    <main className="flex-1 p-4 sm:p-6 overflow-y-auto bg-neutral-bg dark:bg-dm-background transition-colors duration-300"> {/* Updated background */}
      {children}
    </main>
  );
};

export default MainContent;