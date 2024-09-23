'use client';

import { Button } from "@/components/ui/button";
import { amenitiesData, Amenity } from "@/lib/config/amenities"; 

interface TagInputProps {
  label: string;
  value: string[];
  onChange: (tags: string[]) => void;
}

export function TagInput({ label, value, onChange }: TagInputProps) {
  const handleToggleTag = (amenity: Amenity) => {
    if (value.includes(amenity.label)) {
      onChange(value.filter((t) => t !== amenity.label));
    } else {
      onChange([...value, amenity.label]);
    }
  };

  return (
    <div className="mb-4 flex">
      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
        <div className="flex flex-wrap items-center border rounded p-2">
          {value.map((tag, index) => {
            const amenity = amenitiesData.find((amenity) => amenity.label === tag);
            return (
              <span
                key={index}
                className="bg-blue-200 text-gray-700 rounded-full px-4 py-1 mr-2 mb-2 flex items-center"
              >
                <span className="mr-2">{amenity && <amenity.icon />}</span>
                {tag}
                <Button
                  variant="link"
                  className="ml-2 text-red-500"
                  onClick={() => handleToggleTag(amenity!)}
                >
                  &times;
                </Button>
              </span>
            );
          })}
        </div>
      </div>

      <div className="flex-1 ml-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Select Amenities</label>
        <div className="grid grid-cols-2 gap-2">
          {amenitiesData.map((amenity, index) => (
            <Button
              key={index}
              className={`flex items-center justify-between p-2 border rounded-md ${
                value.includes(amenity.label) ? "bg-blue-300 border-blue-300" : "bg-gray-500 border-gray-300"
              } hover:bg-gray-100`}
              onClick={() => handleToggleTag(amenity)}
            >
              <span className="mr-2">{<amenity.icon />}</span>
              <span>{amenity.label}</span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
