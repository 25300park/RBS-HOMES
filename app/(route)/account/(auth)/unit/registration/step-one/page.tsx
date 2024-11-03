import StepOneForm from "./form";

export interface StepOneProps {
  
};

const StepOne = ({  }: StepOneProps): React.ReactNode => {
  return <div className="w-full">
    <StepOneForm />
  </div>
};

export default StepOne;