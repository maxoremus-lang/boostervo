import { prospects, currentUser } from "../_lib/mockData";
import ProspectCard from "../_components/ProspectCard";
import BottomNav from "../_components/BottomNav";

export default function DashboardPage() {
  const urgents = prospects.filter((p) => p.isUrgent && p.status === "pending");
  const todos = prospects.filter((p) => !p.isUrgent && p.status === "pending");
  const doneCount = prospects.filter((p) =>
    ["appointment", "test_drive", "quote_sent", "sold"].includes(p.status)
  ).length;
  const toCallCount = prospects.filter((p) => p.status === "pending").length;

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="bg-bleu px-5 pt-6 pb-8 text-white">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-xs opacity-80">Bonjour,</p>
            <h1 className="text-xl font-nunito font-extrabold">{currentUser.name}</h1>
          </div>
          <div className="relative">
            <div className="w-10 h-10 bg-white/15 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
            </div>
            {urgents.length > 0 && (
              <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-orange rounded-full border-2 border-bleu"></span>
            )}
          </div>
        </div>
      </div>

      {/* Stats rapides */}
      <div className="px-5 -mt-5">
        <div className="bg-white rounded-2xl shadow-md p-4 grid grid-cols-3 gap-2">
          <div className="text-center border-r border-gray-100">
            <div className="text-2xl font-nunito font-extrabold text-orange">{toCallCount}</div>
            <div className="text-[10px] text-gray-500 uppercase font-semibold">À rappeler</div>
          </div>
          <div className="text-center border-r border-gray-100">
            <div className="text-2xl font-nunito font-extrabold text-red-600">{urgents.length}</div>
            <div className="text-[10px] text-gray-500 uppercase font-semibold">Urgents</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-nunito font-extrabold text-green-600">{doneCount}</div>
            <div className="text-[10px] text-gray-500 uppercase font-semibold">Faits</div>
          </div>
        </div>
      </div>

      {/* Urgents */}
      {urgents.length > 0 && (
        <div className="px-5 mt-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-nunito font-extrabold text-gray-800 flex items-center gap-2">
              <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></span>
              Urgents
            </h2>
            <span className="text-xs text-gray-400">{urgents.length} rappels</span>
          </div>
          <div className="space-y-3">
            {urgents.map((p) => (
              <ProspectCard key={p.id} prospect={p} variant="urgent" />
            ))}
          </div>
        </div>
      )}

      {/* À rappeler */}
      {todos.length > 0 && (
        <div className="px-5 mt-6">
          <h2 className="font-nunito font-extrabold text-gray-800 mb-3">À rappeler aujourd&apos;hui</h2>
          <div className="space-y-3">
            {todos.map((p) => (
              <ProspectCard key={p.id} prospect={p} />
            ))}
          </div>
        </div>
      )}

      {urgents.length === 0 && todos.length === 0 && (
        <div className="px-5 mt-10 text-center">
          <div className="text-4xl mb-3">🎉</div>
          <p className="font-nunito font-bold text-gray-700">Beau travail !</p>
          <p className="text-sm text-gray-500 mt-1">Aucun rappel à faire pour l&apos;instant.</p>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
