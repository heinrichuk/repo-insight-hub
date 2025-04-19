
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface HeaderProps {
  className?: string;
}

const Header = ({ className }: HeaderProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className={cn("bg-ubs-blue text-white py-4 px-6 shadow-md", className)}>
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold mr-4">Talk2Code</h1>
          <span className="hidden md:inline-block text-sm bg-ubs-lightblue px-2 py-1 rounded">Beta</span>
        </div>
        
        <div className="hidden md:flex items-center space-x-4">
          <Button variant="link" className="text-white hover:text-gray-300">Documentation</Button>
          <Button variant="outline" className="text-white border-white hover:bg-white hover:text-ubs-blue">Feedback</Button>
        </div>
        
        <div className="md:hidden">
          <Button variant="ghost" onClick={() => setIsOpen(!isOpen)} className="text-white">
            <span className="sr-only">Open menu</span>
            {isOpen ? (
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            )}
          </Button>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden mt-4 bg-ubs-blue">
          <div className="flex flex-col space-y-2 px-6 py-4">
            <Button variant="link" className="text-white hover:text-gray-300 text-left">Documentation</Button>
            <Button variant="outline" className="text-white border-white hover:bg-white hover:text-ubs-blue">Feedback</Button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
