import Logo from "../../assets/icon.png";

export default function Navbar() {
  return (
    <nav className="w-full h-16 bg-rossoTag">
      <div className="lg:container lg:mx-auto mx-3 flex flex-row gap-10 items-center h-full">
        <img src={Logo} alt="logo" className="h-12 w-12 rounded-lg" />
        <h2 className="text-white font-bold text-xl">
          TagTeamTournament Standings
        </h2>
      </div>
    </nav>
  );
}
