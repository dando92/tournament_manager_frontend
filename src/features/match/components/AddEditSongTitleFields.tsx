import { Song } from "@/features/song/types/Song";
import Select from "react-select";
import { btnSecondary } from "@/styles/buttonStyles";
import { selectPortalStyles } from "@/styles/selectStyles";

type AddEditSongTitleFieldsProps = {
  songGroups: string[];
  selectedGroupName: string;
  songSearch: string;
  selectedSong: Song | null;
  filteredSongs: Song[];
  onGroupChange: (group: string) => void;
  onSearchChange: (value: string) => void;
  onSongSelect: (song: Song) => void;
};

export default function AddEditSongTitleFields({
  songGroups,
  selectedGroupName,
  songSearch,
  selectedSong,
  filteredSongs,
  onGroupChange,
  onSearchChange,
  onSongSelect,
}: AddEditSongTitleFieldsProps) {
  return (
    <div className="flex flex-col gap-3">
      <div>
        <h3 className="mb-2">Select pack</h3>
        <Select
          options={songGroups.map((group) => ({ value: group, label: group }))}
          placeholder="Select pack..."
          value={selectedGroupName ? { value: selectedGroupName, label: selectedGroupName } : null}
          onChange={(selected) => onGroupChange(selected?.value ?? "")}
          menuPortalTarget={document.body}
          styles={selectPortalStyles}
        />
      </div>

      <div>
        <h3 className="mb-2">Search song</h3>
        <input
          type="search"
          value={songSearch}
          onChange={(event) => onSearchChange(event.target.value)}
          className="w-full border border-gray-300 px-3 py-2 rounded-lg"
          placeholder="Search by title or artist"
        />
      </div>

      <div>
        <h3 className="mb-2">Songs</h3>
        {filteredSongs.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-4 text-sm text-gray-400 italic">
            No songs match the current filters.
          </div>
        ) : (
          <div className="max-h-72 overflow-y-auto rounded-lg border border-gray-200 divide-y divide-gray-100 bg-white">
            {filteredSongs.map((song) => {
              const isSelected = selectedSong?.id === song.id;
              const label = song.artist ? `${song.artist} - ${song.title}` : song.title;

              return (
                <button
                  key={song.id}
                  type="button"
                  onClick={() => onSongSelect(song)}
                  className={`w-full px-3 py-2.5 text-left transition-colors ${
                    isSelected ? "bg-primary-dark/10" : "hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 shrink-0 text-center text-xs font-bold text-white bg-primary rounded">
                      {song.difficulty}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium text-gray-900">{label}</div>
                      <div className="text-xs text-gray-500">{song.group}</div>
                    </div>
                    {isSelected && (
                      <span className={`shrink-0 text-xs ${btnSecondary}`.replace("px-3 py-2", "px-2 py-1")}>
                        Selected
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
