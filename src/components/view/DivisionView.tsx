import { useState } from "react";
import { Division } from "@/models/Division";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";
import BracketsTab from "@/components/view/BracketsTab";
import SongsList from "@/components/manage/songs/SongsList";
import { useAuthContext } from "@/services/auth/AuthContext";

type Tab = "Overview" | "Brackets" | "Songs" | "Standings" | "Stats";
const TABS: Tab[] = ["Overview", "Brackets", "Songs", "Standings", "Stats"];

type DivisionViewProps = {
  division: Division;
  tournamentId: number;
  controls: boolean;
  onBack: () => void;
};

export default function DivisionView({ division, tournamentId, controls, onBack }: DivisionViewProps) {
  const [activeTab, setActiveTab] = useState<Tab>("Brackets");
  const { state: authState } = useAuthContext();
  const canEditSongs =
    !!authState.account &&
    (authState.account.isAdmin || authState.account.isTournamentCreator);

  return (
    <div className="flex flex-col gap-3">
      {/* Back + title */}
      <div className="flex items-center gap-2">
        <button
          onClick={onBack}
          className="text-gray-400 hover:text-gray-600 flex items-center gap-1.5 text-sm"
        >
          <FontAwesomeIcon icon={faChevronLeft} className="text-xs" />
          All divisions
        </button>
        <span className="text-gray-300">/</span>
        <span className="text-sm font-semibold text-gray-700">{division.name}</span>
      </div>

      {/* Tab bar */}
      <div className="flex items-end border-b border-gray-200 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm border-b-2 shrink-0 transition-colors ${
              activeTab === tab
                ? "border-blue-500 text-blue-600 font-semibold"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="mt-1">
        {activeTab === "Brackets" && (
          <BracketsTab division={division} controls={controls} tournamentId={tournamentId} />
        )}
        {activeTab === "Songs" && (
          <SongsList canEdit={canEditSongs} tournamentId={tournamentId} />
        )}
        {activeTab !== "Brackets" && activeTab !== "Songs" && (
          <p className="text-sm text-gray-400 italic">Coming soon</p>
        )}
      </div>
    </div>
  );
}
