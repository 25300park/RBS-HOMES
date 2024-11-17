import EditForm from "./form";

interface EditUnitPageProps {
  params: {
    id: string;
  };
}

const EditUnitPage = ({ params }: EditUnitPageProps) => {
  return (
    <div className="container mx-auto py-6">
      <EditForm unitId={params.id} />
    </div>
  );
};

export default EditUnitPage;