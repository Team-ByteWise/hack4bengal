import React from "react";
import Logo from "../Logo/Logo";
import "../Navbar/style.css"
import { motion } from "framer-motion";

function Navbar() {
  return (
    <header>
      <nav className="flex items-center justify-between p-10">
        <div className="w-3/12 flex items-center justify-center">
          <Logo />
        </div>
        <div className="w-7/12 flex flex-shrink justify-evenly items-center gap-x-11">
          <a
            href="#home"
            className=" link no-underline text-lg  font-medium  text-[#2b1f6f]"
          >
            Home
          </a>
          <a
            href="#site"
            className="no-underline text-lg  font-medium  text-[#2b1f6f] link"
          >
            Site Knowledge
          </a>

          <a
            href="#"
            className="no-underline text-lg  font-medium  text-[#2b1f6f] link"
          >
            Contact us
          </a>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 600, damping: 10 }}
            className="bg-gradient-to-br from-[#4E37D9] from-20% via-[#4C3EA0] via-40% to-[#19114B] to-90% text-white font-semibold px-6 py-2 rounded-2xl group"
          >
            <span>Download</span>
          </motion.button>
        </div>
      </nav>
    </header>
  );
}

export default Navbar;