import Spinner from "@/components/ui/spinner";
export interface LoadingProps {}

const Loading = async ({}: LoadingProps) => {
  return (
    <div className="w-screen h-screen flex justify-center items-center">
        <Spinner />
    </div>
  );
};

export default Loading;
