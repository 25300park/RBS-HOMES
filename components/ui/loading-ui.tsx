import Spinner from "@/components/ui/spinner";

export const LodaingUi = () => {
  return (
    <div className="w-full h-screen flex justify-center">
      <div className="mt-96">
        <Spinner />
      </div>
    </div>
  );
};
