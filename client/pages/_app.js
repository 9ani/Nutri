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
import Head from 'next/head';
import { Analytics } from "@vercel/analytics/react";
import { ClerkProvider } from "@clerk/nextjs";
import "../styles/globals.css";

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <link rel="icon" href="/icon.png" />
        <title>NutriWeek</title>

      </Head>
      <ClerkProvider>
        <Component {...pageProps} />
        <Analytics />
      </ClerkProvider>
    </>
  );
}

export default MyApp;
