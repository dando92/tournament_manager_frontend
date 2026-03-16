import { Tab } from "@headlessui/react";
import { classNames } from "@/styles/classNames";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faCircle, faTrophy } from "@fortawesome/free-solid-svg-icons";
import LivePhase from "@/components/view/LivePhase";
import TournamentSettings from "@/components/manage/tournament/TournamentSettings";
import TournamentSelector from "@/components/TournamentSelector";
import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { Tournament } from "@/models/Tournament";
import { useMatchHub } from "@/services/useMatchHub";

export default function ViewPage() {
  const { tournamentId: tidParam } = useParams<{ tournamentId?: string }>();
  const navigate = useNavigate();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  const selectedTournamentId = tidParam ? Number(tidParam) : null;

  useEffect(() => {
    setIsLoading(true);
    axios.get<Tournament[]>("tournaments/public")
      .then((r) => { setTournaments(r.data); setError(null); })
      .catch(() => setError("Failed to load tournaments."))
      .finally(() => setIsLoading(false));
  }, []);

  const [matchUpdateSignal, setMatchUpdateSignal] = useState(0);
  const onMatchUpdate = useCallback(() => { setMatchUpdateSignal(s => s + 1); }, []);
  useMatchHub(onMatchUpdate, selectedTournamentId ?? undefined);

  // ── Tournament list ───────────────────────────────────────────────────────
  if (selectedTournamentId === null) {
    return (
      <TournamentSelector
        tournaments={tournaments}
        onSelect={(t) => navigate(`/view/${t.id}`)}
        loading={isLoading}
        error={error}
      />
    );
  }

  // ── Tournament detail (Matches | Live) ────────────────────────────────────
  return (
    <div className="text-white">
      <div className="flex items-center gap-3 mb-2">
        <button
          onClick={() => navigate("/view")}
          className="text-rossoTesto hover:underline flex items-center gap-1.5 text-sm"
        >
          <FontAwesomeIcon icon={faArrowLeft} />
          <span>Back</span>
        </button>
      </div>

      <Tab.Group>
        <Tab.List className="flex flex-row gap-10 border-b">
          {(["Matches", "Live"] as const).map((label) => (
            <Tab
              key={label}
              className={({ selected }) =>
                classNames(
                  "py-2 px-4 text-lg",
                  selected ? "border-b-2 border-blue-500 font-bold text-rossoTesto" : "text-gray-500",
                )
              }
            >
              <div className="flex flex-row gap-3 items-center">
                <FontAwesomeIcon
                  icon={label === "Matches" ? faTrophy : faCircle}
                  className={classNames(
                    "text-rossoTesto text-sm",
                    label === "Live" ? "animate-pulse" : "",
                  )}
                />
                <span>{label}</span>
              </div>
            </Tab>
          ))}
        </Tab.List>

        <Tab.Panels className="mt-3">
          <Tab.Panel>
            <TournamentSettings
              controls={false}
              tournamentId={selectedTournamentId}
              matchUpdateSignal={matchUpdateSignal}
            />
          </Tab.Panel>

          <Tab.Panel>
            <LivePhase tournamentId={selectedTournamentId} />
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
}
