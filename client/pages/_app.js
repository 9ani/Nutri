// import Modal from "../components/Modal"; 
// import "../styles/globals.css";

// function MyApp({ Component, pageProps }) {
//   return (
//     <div>
//       <Modal />
      
//       <Component {...pageProps} />
      
//     </div>
//   )
// }

// export default MyApp

import { SessionProvider } from "next-auth/react";
import "../styles/globals.css";

function MyApp({ Component, pageProps: { session, ...pageProps } }) {
  return (
    <SessionProvider session={session}>
      <Component {...pageProps} />
    </SessionProvider>
  );
}

export default MyApp;