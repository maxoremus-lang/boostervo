"use client";

import Link from "next/link";
import { useState } from "react";
import { currentUser } from "../_lib/mockData";
import BottomNav from "../_components/BottomNav";

export default function ProfilPage() {
  const [pushEnabled, setPushEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="bg-bleu px-5 pt-6 pb-10 text-white text-center">
        <div className="w-20 h-20 bg-white/15 rounded-full mx-auto flex items-center justify-center mb-3">
          <span className="text-3xl font-nunito font-extrabold">
            {currentUser.name.split(" ").map((w) => w[0]).join("")}
          </span>
        </div>
        <h1 className="text-xl font-nunito font-extrabold">{currentUser.name}</h1>
        <p className="text-xs opacity-80">{currentUser.dealership}</p>
      </div>

      <div className="px-5 -mt-5 space-y-4">
        {/* Infos */}
        <div className="bg-white rounded-2xl shadow-sm divide-y divide-gray-100">
          <Row label="Email" value={currentUser.email} />
          <Row label="Numéro BoosterVO" value={currentUser.twilioNumber} />
          <Row label="Concession" value={currentUser.dealership} />
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-2xl shadow-sm p-1">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide px-3 pt-3">Notifications</p>
          <Toggle label="Notifications push" value={pushEnabled} onChange={setPushEnabled} />
          <Toggle label="Son des alertes" value={soundEnabled} onChange={setSoundEnabled} />
        </div>

        {/* Actions */}
        <div className="bg-white rounded-2xl shadow-sm divide-y divide-gray-100">
          <button className="w-full text-left px-4 py-3.5 text-sm font-semibold">Changer le mot de passe</button>
          <button className="w-full text-left px-4 py-3.5 text-sm font-semibold text-gray-500">Installer sur l&apos;écran d&apos;accueil</button>
        </div>

        <Link
          href="/app/login"
          className="block text-center bg-white rounded-2xl shadow-sm py-4 text-red-600 font-bold"
        >
          Se déconnecter
        </Link>

        <p className="text-center text-[11px] text-gray-400 pb-8">BoosterVO Rappels · version 0.1 (démo)</p>
      </div>

      <BottomNav />
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-4 py-3">
      <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">{label}</p>
      <p className="text-sm font-semibold mt-0.5">{value}</p>
    </div>
  );
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between px-3 py-2.5">
      <span className="text-sm font-semibold">{label}</span>
      <button
        onClick={() => onChange(!value)}
        className={`w-11 h-6 rounded-full transition relative ${value ? "bg-orange" : "bg-gray-300"}`}
        aria-pressed={value}
      >
        <span
          className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition shadow ${
            value ? "left-5" : "left-0.5"
          }`}
        />
      </button>
    </div>
  );
}
