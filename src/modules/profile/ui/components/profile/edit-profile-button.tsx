"use client";

import { Edit3 } from "lucide-react";

interface EditProfileButtonProps {
  onEdit: () => void;
}

export default function EditProfileButton({ onEdit }: EditProfileButtonProps) {
  return (
    <button
      onClick={onEdit}
      className="group to-primary text-foreground from-primary/60 relative flex transform items-center gap-2 overflow-hidden rounded-xl bg-linear-to-r px-6 py-3 font-semibold shadow-lg transition-all duration-300 hover:scale-105 hover:from-red-700 hover:to-red-800 hover:shadow-xl"
    >
      <Edit3 size={18} />
      <span>Edit Profile</span>
      <div className="via-foreground/20 absolute inset-0 -translate-x-full bg-linear-to-r from-transparent to-transparent transition-transform duration-700 group-hover:translate-x-full"></div>
    </button>
  );
}
