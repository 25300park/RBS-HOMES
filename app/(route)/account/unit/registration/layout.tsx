import StepNavigation from "../../components/step-navigation";

export default async function layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <div className="max-w-[1140px] mx-auto py-10">
        <StepNavigation />
        {children}
      </div>
  );
}
