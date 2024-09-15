import { AvatarFallback, Avatar, AvatarImage } from "@/components/ui/avatar";
import { FaRegUser } from "react-icons/fa";

interface AdminInfoProps {
  admin: {
    name: string | null;
    email: string;
    mobile: string | null;
    company: string | null;
    image: string | null;
  };
}

const AdminInfo: React.FC<AdminInfoProps> = ({ admin }) => {
  return (
    <div className="sticky top-24 bg-white   rounded border border-gray-200">
      <div className="p-6 flex flex-col items-center">
        <Avatar className="w-16 h-16">
          <AvatarImage src={`${admin.image}`} />
          <AvatarFallback>
            <FaRegUser className="text-3xl" />
          </AvatarFallback>
        </Avatar>
      </div>
      전체 디자인 필요
      <div className="p-6 pt-2">
        <p className="mb-2">
          <strong className="text-gray-600">Name: </strong>{" "}
          {admin.name || "N/A"}
        </p>
        <p className="mb-2">
          <strong className="text-gray-600">Email: </strong> {admin.email}
        </p>
        <p className="mb-2">
          <strong className="text-gray-600">Mobile: </strong>{" "}
          {admin.mobile || "N/A"}
        </p>
        <p>
          <strong className="text-gray-600">Company: </strong>{" "}
          {admin.company || "N/A"}
        </p>
      </div>
    </div>
  );
};

export default AdminInfo;
