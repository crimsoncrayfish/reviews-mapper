import { useStore } from '../store';
import Toast from './Toast';

export default function ToastContainer() {
  const { toasts, removeToast } = useStore();

  return (
    <div className="fixed top-20 right-6 z-50 space-y-3 max-w-md">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
}
