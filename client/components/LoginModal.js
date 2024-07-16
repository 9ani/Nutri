import { useEffect } from "react";
import { signIn, useSession } from "next-auth/react";

const LoginModal = ({ isOpen, closeModal }) => {
  const { data: session } = useSession();

  useEffect(() => {
    if (session) {
      console.log("User Data:", session.user);
      closeModal();
    }
  }, [session, closeModal]);

  return (
    isOpen && (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white rounded-lg shadow-lg p-6 w-96">
          <h2 className="text-xl font-semibold mb-4">Вход</h2>
          <div>
            <button
              type="button"
              onClick={() => signIn("google")}
              className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition duration-300 w-full"
            >
              Войти с Google
            </button>
          </div>
          <div className="flex justify-between items-center mt-4">
            <button
              type="button"
              onClick={closeModal}
              className="text-gray-600 hover:underline"
            >
              Отмена
            </button>
          </div>
        </div>
      </div>
    )
  );
};

export default LoginModal;
