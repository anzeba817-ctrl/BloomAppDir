import { motion } from "motion/react";
import { SunnyMascot } from "./sunny-mascot";
import { Shield, X } from "lucide-react";

interface ShieldModalProps {
  onClose: () => void;
}

export function ShieldModal({ onClose }: ShieldModalProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gradient-to-br from-[#6B4FA0] to-[#8B6FC0] rounded-3xl p-8 max-w-md w-full shadow-2xl text-center relative overflow-hidden"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors"
        >
          <X className="w-5 h-5 text-white" />
        </button>

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="inline-flex items-center gap-2 bg-white/20 text-white px-6 py-2 rounded-full text-sm mb-6"
        >
          <Shield className="w-4 h-4" />
          bloom shield activé
        </motion.div>

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-6 flex justify-center"
        >
          <SunnyMascot mood="shielded" size={160} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-white space-y-4"
        >
          <h2 className="text-2xl font-bold">série protégée</h2>
          <p className="text-white/90 leading-relaxed">
            un pétale de cristal a sauvé la mise. série protégée. va te reposer — sunny gère la situation.
          </p>
          <div className="bg-white/10 rounded-2xl p-4 text-sm">
            <p className="text-white/80">
              💎 tu as utilisé 1 pétale de cristal
            </p>
          </div>
        </motion.div>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onClose}
          className="mt-8 w-full bg-white text-[#6B4FA0] py-4 rounded-2xl shadow-lg"
        >
          merci sunny 💜
        </motion.button>

        {/* Decorative glow */}
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-[#F5C030] rounded-full blur-3xl opacity-20" />
        <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-white rounded-full blur-3xl opacity-20" />
      </motion.div>
    </motion.div>
  );
}
