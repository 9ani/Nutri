import React from "react";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { Menu, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { ChevronDownIcon } from "@heroicons/react/solid";

const Header = ({ weekPlanLength, handleShow, handleShow1, handleLogin }) => {
  const { data: session } = useSession();

  return (
    <header
      className={"header-container" + (weekPlanLength === 0 ? "" : " user")}
    >
      <div className="header-content">
        <div className="header-title">
          <Image
            src={
              weekPlanLength === 0 ? "/images/logo1.png" : "/images/logo2.jpg"
            }
            alt="logo"
            width={70}
            height={64}
          />
          <a href="/" className="header-link">
            NUTRIWEEK
          </a>
        </div>
        <nav className="header-nav">
          <div className="header-nav1">
            <a href="#" className="header-nav-link">
              О нас
            </a>
            <a href="#" className="header-nav-link">
              помощь
            </a>
            <a href="#" className="header-nav-link">
              Контакты
            </a>
          </div>
          {session ? (
            <div className="header-nav2">
              <Menu as="div" className="relative inline-block text-left">
                <div>
                  <Menu.Button className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none">
                    <img
                      src={session.user.image}
                      alt="User Avatar"
                      className="h-8 w-8 rounded-full"
                    />
                    <ChevronDownIcon className="-mr-1 ml-2 h-5 w-5" />
                  </Menu.Button>
                </div>

                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="py-1">
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={() => signOut()}
                            className={`${
                              active ? "bg-gray-100" : ""
                            } block px-4 py-2 text-sm text-gray-700`}
                          >
                            Logout
                          </button>
                        )}
                      </Menu.Item>
                    </div>
                  </Menu.Items>
                </Transition>
              </Menu>
            </div>
          ) : (
            weekPlanLength === 0 && (
              <div className="header-nav2">
                <button
                  onClick={handleLogin}
                  className="bg-[#28511D] text-white py-2 px-4 rounded hover:bg-[#1e3b16] transition duration-300"
                >
                  Вход
                </button>
                <button>
                  <a href="/auth/signup" className="header-nav-link">
                    Регистрация
                  </a>
                </button>
              </div>
            )
          )}
          {weekPlanLength > 0 && !session && (
            <div className="header-nav2">
              <button
                onClick={handleShow}
                className="bg-[#28511D] text-white py-2 px-4 rounded hover:bg-[#1e3b16] transition duration-300"
              >
                Добавить прием пищи
              </button>
              <button
                onClick={handleShow1}
                className="bg-[#28511D] text-white py-2 px-4 rounded hover:bg-[#1e3b16] transition duration-300"
              >
                Добавить меню
              </button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
