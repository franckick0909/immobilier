"use client";

import { motion } from "framer-motion";

interface PasswordStrengthProps {
  password: string;
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
  const calculateStrength = (password: string) => {
    let strength = 0;

    // Longueur minimale
    if (password.length >= 8) strength += 25;

    // Contient des chiffres
    if (/\d/.test(password)) strength += 25;

    // Contient des minuscules et majuscules
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 25;

    // Contient des caractères spéciaux
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength += 25;

    return strength;
  };

  const getStrengthText = (strength: number) => {
    if (strength === 0) return "";
    if (strength <= 25) return "Faible";
    if (strength <= 50) return "Moyen";
    if (strength <= 75) return "Bon";
    return "Excellent";
  };

  const getStrengthColor = (strength: number) => {
    if (strength <= 25) return "bg-red-500";
    if (strength <= 50) return "bg-orange-500";
    if (strength <= 75) return "bg-yellow-500";
    return "bg-green-500";
  };

  const strength = calculateStrength(password);
  const strengthText = getStrengthText(strength);
  const strengthColor = getStrengthColor(strength);

  return (
    <div className="mt-1 space-y-2">
      <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          className={`h-full ${strengthColor}`}
          initial={{ width: 0 }}
          animate={{ width: `${strength}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
      {password && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`text-sm ${
            strength <= 25
              ? "text-red-500"
              : strength <= 50
              ? "text-orange-500"
              : strength <= 75
              ? "text-yellow-600"
              : "text-green-600"
          }`}
        >
          Force du mot de passe : {strengthText}
        </motion.p>
      )}
    </div>
  );
}
