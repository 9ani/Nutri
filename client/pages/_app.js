import Modal from "../components/Modal"; 
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
