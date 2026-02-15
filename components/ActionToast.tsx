import React from 'react';
import { CheckCircle2, Info, AlertTriangle } from 'lucide-react';

type ToastTone = 'success' | 'info' | 'warning';

interface ActionToastProps {
  message: string;
  visible: boolean;
  tone?: ToastTone;
}

const toneClasses: Record<ToastTone, string> = {
  success: 'bg-green-500/15 border-green-500/50 text-green-300',
  info: 'bg-arcade-primary/20 border-arcade-primary/50 text-white',
  warning: 'bg-orange-500/15 border-orange-500/50 text-orange-200',
};

const ToneIcon: Record<ToastTone, React.FC<{ size?: number; className?: string }>> = {
  success: CheckCircle2,
  info: Info,
  warning: AlertTriangle,
};

export const ActionToast: React.FC<ActionToastProps> = ({ message, visible, tone = 'info' }) => {
  if (!visible || !message) return null;
  const Icon = ToneIcon[tone];

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[130] animate-in slide-in-from-top-2 fade-in duration-200">
      <div className={`px-4 py-2 rounded-xl border backdrop-blur flex items-center gap-2 shadow-2xl ${toneClasses[tone]}`}>
        <Icon size={16} />
        <span className="text-sm font-bold whitespace-nowrap">{message}</span>
      </div>
    </div>
  );
};
