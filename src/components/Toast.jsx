import { useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';

export default function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const icons = {
    success: <CheckCircle className="text-emerald-400" size={20} />,
    error: <XCircle className="text-rose-400" size={20} />,
    warning: <AlertCircle className="text-amber-400" size={20} />
  };

  const colors = {
    success: 'border-emerald-500/50 bg-emerald-950/90',
    error: 'border-rose-500/50 bg-rose-950/90',
    warning: 'border-amber-500/50 bg-amber-950/90'
  };

  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border ${colors[type]} shadow-2xl animate-slideIn backdrop-blur-sm`}>
      {icons[type]}
      <p className="text-slate-100 font-medium flex-1">{message}</p>
      <button
        onClick={onClose}
        className="text-slate-400 hover:text-slate-100 transition-colors"
      >
        <X size={18} />
      </button>
    </div>
  );
}
