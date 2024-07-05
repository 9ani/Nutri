// pages/_app.js
import Modal from "../components/Modal"; // Adjust the path according to your actual structure
import "../styles/globals.css";

function MyApp({ Component, pageProps }) {
  return (
    <div>
      <Modal />
      <Component {...pageProps} />
    </div>
  );
}

export default MyApp;
