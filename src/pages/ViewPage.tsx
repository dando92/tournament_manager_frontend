import { Tab } from "@headlessui/react";
import { classNames } from "@/styles/classNames";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircle, faTrophy } from "@fortawesome/free-solid-svg-icons";
import LivePhase from "@/components/view/LivePhase";
import TournamentSettings from "@/components/manage/tournament/TournamentSettings";
import { useState, useEffect, useCallback } from "react";
import { useParams, Navigate } from "react-router-dom";
import axios from "axios";
import { Tournament } from "@/models/Tournament";
import { useMatchHub } from "@/services/useMatchHub";
import { addRecentTournament, getSelectedTournament } from "@/services/recentTournaments";

export default function ViewPage() {
  const { tournamentId: tidParam } = useParams<{ tournamentId?: string }>();

  const selectedTournamentId = tidParam ? Number(tidParam) : null;

  // If no tournament in URL, redirect to last selected or the select page
  if (selectedTournamentId === null) {
    const last = getSelectedTournament();
    if (last) {
      return <Navigate to={`/view/${last.id}`} replace />;
    }
    return <Navigate to="/select" replace />;
  }

  return <ViewTournament tournamentId={selectedTournamentId} />;
}

function ViewTournament({ tournamentId }: { tournamentId: number }) {
  useEffect(() => {
    axios
      .get<Tournament>(`tournaments/${tournamentId}`)
      .then((r) => {
        addRecentTournament({ id: r.data.id, name: r.data.name });
      })
      .catch(() => {});
  }, [tournamentId]);

  const [matchUpdateSignal, setMatchUpdateSignal] = useState(0);
  const onMatchUpdate = useCallback(() => {
    setMatchUpdateSignal((s) => s + 1);
  }, []);
  useMatchHub(onMatchUpdate, tournamentId);

  return (
    <div className="text-white">
      <Tab.Group>
        <Tab.List className="flex flex-row gap-10 border-b">
          {(["Matches", "Live"] as const).map((label) => (
            <Tab
              key={label}
              className={({ selected }) =>
                classNames(
                  "py-2 px-4 text-lg",
                  selected
                    ? "border-b-2 border-blue-500 font-bold text-rossoTesto"
                    : "text-gray-500",
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
              tournamentId={tournamentId}
              matchUpdateSignal={matchUpdateSignal}
            />
          </Tab.Panel>

          <Tab.Panel>
            <LivePhase tournamentId={tournamentId} />
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
}
