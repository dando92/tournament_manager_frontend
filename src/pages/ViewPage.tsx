import { Tab } from "@headlessui/react";
import { classNames } from "../utils/classNames";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircle, faTrophy } from "@fortawesome/free-solid-svg-icons";
import LivePhase from "../components/view/LivePhase";
import TournamentSettings from "../components/manage/tournament/TournamentSettings";
import TournamentRow from "../components/view/TournamentRow";
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Tournament } from "../models/Tournament";
import { useAuthContext } from "../services/auth/AuthContext";
import { useMatchHub } from "../services/useMatchHub";

export default function ViewPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [registeredIds, setRegisteredIds] = useState<number[]>([]);
  const [selectedTournamentId, setSelectedTournamentId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { state: authState } = useAuthContext();

  useEffect(() => {
    setIsLoading(true);
    axios.get<Tournament[]>("tournaments/public")
      .then((r) => { setTournaments(r.data); setError(null); })
      .catch(() => setError("Failed to load tournaments."))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    if (authState.account) {
      axios.get<number[]>("tournaments/player-registrations")
        .then((r) => setRegisteredIds(r.data))
        .catch(() => {});
    }
  }, [authState.account]);

  const [matchUpdateSignal, setMatchUpdateSignal] = useState(0);
  const onMatchUpdate = useCallback(() => { setMatchUpdateSignal(s => s + 1); }, []);
  useMatchHub(onMatchUpdate, selectedTournamentId ?? undefined);

  const registeredTournaments = tournaments.filter((t) => registeredIds.includes(t.id));
  const otherTournaments = tournaments.filter((t) => !registeredIds.includes(t.id));
  const isLoggedIn = !!authState.account;

  return (
    <div className="text-white">
      <Tab.Group>
        <Tab.List className="flex flex-row gap-10 border-b mt-5">
          <Tab
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
              <FontAwesomeIcon icon={faTrophy} className="text-rossoTesto text-sm" />
              <span>Tournaments</span>
            </div>
          </Tab>
          <Tab
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
                icon={faCircle}
                className="text-rossoTesto text-sm animate-pulse"
              />
              <span>LIVE</span>
            </div>
          </Tab>
        </Tab.List>
        <Tab.Panels className="mt-3">
          <Tab.Panel>
            {isLoading && <p className="text-gray-400 mt-4">Loading...</p>}
            {error && <p className="text-red-500 mt-4">{error}</p>}
            {!isLoading && !error && (
              selectedTournamentId === null ? (
                <div className="flex flex-col gap-4 mt-4">
                  {tournaments.length === 0 && (
                    <p className="text-gray-500 text-center">No tournaments yet.</p>
                  )}
                  {isLoggedIn && registeredTournaments.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Your Tournaments</h3>
                      <div className="flex flex-col gap-2">
                        {registeredTournaments.map((t) => (
                          <TournamentRow key={t.id} t={t} onClick={() => setSelectedTournamentId(t.id)} />
                        ))}
                      </div>
                    </div>
                  )}
                  {isLoggedIn && otherTournaments.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Other Tournaments</h3>
                      <div className="flex flex-col gap-2">
                        {otherTournaments.map((t) => (
                          <TournamentRow key={t.id} t={t} onClick={() => setSelectedTournamentId(t.id)} />
                        ))}
                      </div>
                    </div>
                  )}
                  {!isLoggedIn && (
                    <div className="flex flex-col gap-2">
                      {tournaments.map((t) => (
                        <TournamentRow key={t.id} t={t} onClick={() => setSelectedTournamentId(t.id)} />
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <button
                    onClick={() => setSelectedTournamentId(null)}
                    className="text-rossoTesto hover:underline text-sm mb-4 flex items-center gap-1"
                  >
                    ← Back to tournaments
                  </button>
                  <TournamentSettings controls={false} tournamentId={selectedTournamentId} matchUpdateSignal={matchUpdateSignal} />
                </div>
              )
            )}
          </Tab.Panel>
          <Tab.Panel>
            <LivePhase />
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
}
