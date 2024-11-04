interface MenuCardProps {
  icon: React.ElementType;
  name: string;
  description: string;
  onClick: () => void;
}

function MenuCard({ icon: Icon, name, description, onClick }: MenuCardProps) {
  return (
    <div
      onClick={onClick}
      className="p-6 rounded-2xl border shadow-lg transition-all cursor-pointer space-y-4 bg-white"
    >
      <div className="w-12 h-12 ounded-2xl flex items-center justify-center">
        <Icon className="w-6 h-6 text-gray-600" />
      </div>
      <div>
        <h3 className="font-medium text-lg">{name}</h3>
        <p className="text-gray-500 text-sm mt-1">{description}</p>
      </div>
    </div>
  );
}

export default MenuCard;