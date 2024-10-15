import StepNavigation from "../../components/step-navigation";

export default async function layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="w-full bg-white h-full">
      {/* <div className="h-28 border-b flex items-end px-12 py-4 bg-zinc-50">
        <h2 className="font-semibold text-2xl">Unit Registeration</h2>
      </div> */}
      <div className="">
        <StepNavigation />
        {children}
      </div>
    </div>
  );
}
