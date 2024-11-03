import ReviewForm from "./form";

export interface ReviewPageProps {}

const ReviewPage = ({}: ReviewPageProps): React.ReactNode => {
  return (
    <div>
      <ReviewForm />
    </div>
  );
};

export default ReviewPage;
