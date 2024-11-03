import { memo } from "react";

const DotLoader = memo(({ isLoading }: { isLoading: boolean }) =>
  isLoading ? (
    <div className="absolute left-1/2 transform -translate-x-1/2 top-20 md:top-28 z-50 transition-all duration-500 ease-in-out">
      <div className="bg-white p-4 shadow-2xl rounded-full">
        <div className="dot-loader" />
      </div>
    </div>
  ) : null
);

DotLoader.displayName = "DotLoader";

export default DotLoader;  