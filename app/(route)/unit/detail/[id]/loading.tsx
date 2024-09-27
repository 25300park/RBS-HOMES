import Spinner from "@/components/ui/spinner";
export interface LoadingProps {}

const Loading = async ({}: LoadingProps) => {
  return (
    <div className="w-screen h-screen flex justify-center">
      <div className="mt-96">
        <Spinner />
      </div>
    </div>
  );
};

export default Loading;
