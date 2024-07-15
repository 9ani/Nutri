import * as React from "react";

function MyComponent({ children }) {
  return (
    <div className="flex flex-col justify-center bg-black bg-opacity-0">
      <div className="flex flex-col w-full bg-lime-900 max-md:max-w-full">
        <img
          loading="lazy"
          srcSet="..."
          className="z-10 w-full aspect-[10] max-md:max-w-full"
        />
        <div className="pt-16 pl-11 w-full bg-black bg-opacity-0 max-md:pl-5 max-md:max-w-full">
          <div className="flex gap-5 max-md:flex-col max-md:gap-0">
            <div className="flex flex-col w-[55%] max-md:ml-0 max-md:w-full">
              <div className="flex flex-col self-stretch my-auto max-md:mt-10 max-md:max-w-full">
                <div className="text-8xl text-lime-400 max-md:max-w-full max-md:text-4xl">
                  Планировка рациона питания
                </div>
                <div className="mt-20 text-2xl font-bold text-lime-400 max-md:mt-10 max-md:max-w-full">
                  Введите свои диетические предпочтения, чтобы составить план
                  питания.
                </div>
                <div className="mt-12 text-2xl font-bold text-lime-400 max-md:mt-10 max-md:max-w-full">
                  Питание на неделю
                </div>
              </div>
              <div className="flex flex-col mt-10 w-3/5 gap-5 justify-around max-md:mt-10 max-md:mr-0 max-md:ml-0 max-md:w-full">
                <div className="flex flex-col text-black text-xl font-normal text-lime-400 leading-6 max-md:max-w-full">
                  Введите свои предпочтения, чтобы получить план питания на
                  неделю
                </div>
              </div>
              <div className="mt-10 max-md:mt-0 max-md:w-full max-md:pl-0"></div>
              <div className="flex flex-col gap-5 justify-between mt-16 w-[65%] max-md:mt-10 max-md:w-full"></div>
            </div>
            <div className="pt-6 max-md:ml-0 max-md:mt-0 max-md:w-full"></div>
          </div>
          <div className="flex flex-row gap-4 max-md:flex-col max-md:gap-0"></div>
        </div>
      </div>
      {children}
    </div>
  );
}

export default MyComponent;
