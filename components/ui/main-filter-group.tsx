import { Button } from "./button";
import FilterButton from "./filter-btn";

export interface MainFilterGroupProps {}

const MainFilterGroup = ({}: MainFilterGroupProps): React.ReactNode => {
  return (
    <div className="flex gap-2">
      <FilterButton />
      <SellTypeButton type="rent" />
      <SellTypeButton type="buy" />
    </div>
  );
};

export default MainFilterGroup;

const SellTypeButton = ({ type }: { type: string }) => {
  return (
    <Button
      className={`py-5 space-x-2  relative w-[100px]`}
      variant={"outline"}
    >
      <img src={`/assets/icons/${type}.png`} /> <p>{type.toUpperCase()}</p>
    </Button>
  );
};

// ${
//   activeFilterCount > 0 ? "border-orange-400 border-2" : "border"
// }
