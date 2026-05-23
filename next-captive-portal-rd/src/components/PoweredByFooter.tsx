export default function PoweredByFooter() {
  const year = new Date().getFullYear();
  return (
    <div className="flex flex-col items-center gap-1.5 py-5">
      {/* <img
        src="/AuraConnect-48px.png"
        alt="AuraConnect"
        className="h-5 w-auto opacity-60"
        draggable={false}
      /> */}
      <p className="text-[11px] text-gray-400 font-medium select-none">
        Powered by AuraConnect &copy; {year}
      </p>
    </div>
  );
}
