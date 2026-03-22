type PathRowProps = {
  ordinalLabel: string;
  sourceMatchName: string;
  colSpan: number;
  isSelected: boolean;
  onToggle: () => void;
};

export default function PathRow({ ordinalLabel, sourceMatchName, colSpan, isSelected, onToggle }: PathRowProps) {
  return (
    <tr
      className={`border-t border-gray-100 cursor-pointer transition-colors ${
        isSelected ? "bg-green-50" : "hover:bg-gray-50"
      }`}
      onClick={onToggle}
    >
      <td
        colSpan={colSpan}
        className={`px-3 py-2 text-center text-sm italic ${
          isSelected ? "text-green-700 font-medium" : "text-gray-400"
        }`}
      >
        {ordinalLabel} of {sourceMatchName}
      </td>
    </tr>
  );
}
