import React from 'react';

const Header = () => {
  return (
    <header className="w-full h-20" style={{ backgroundColor: '#29B260' }}>
      <div className="mx-auto flex justify-around items-center pt-6">
        <div className="text-lg font-bold text-black font-inter" ><a href='/' style={{textDecoration:"none", color:"black"}}>NUTRIWEEK</a></div>
        <nav className="text-black flex gap-12">
          <a href="#" className="text-black text-decoration-none">CAREERS</a>
          <a href="#" className="text-black text-decoration-none">PRODUCT</a>
          <a href="#" className="text-black text-decoration-none">FREE TOOLS</a>
          <a href="#" className="text-black text-decoration-none">COMPANY</a>
          <a href="#" className="text-black text-decoration-none">SUPPORT</a>
          <a href="#" className="text-black text-decoration-none">LOGIN</a>
        </nav>
      </div>
    </header>
  );
};

export default Header;
