import { useRouter } from 'next/router';
import { useEffect } from 'react';

const AuthModal = ({ show, onClose, setHasJustSignedOut }) => {
  const router = useRouter();

  useEffect(() => {
    if (show) {
      setHasJustSignedOut(false);
    }
  }, [show, setHasJustSignedOut]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">Авторизация требуется</h2>
        <p className="mb-4">Для сохранения и использования плана питания, пожалуйста, войдите в систему.</p>
        <div className="flex justify-end">
          <button
            onClick={() => router.push('/sign-in')}
            className="bg-green-800 text-white px-4 py-2 rounded mr-2"
          >
            Войти
          </button>
          <button
            onClick={onClose}
            className="bg-gray-300 px-4 py-2 rounded"
          >
            Отмена
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;