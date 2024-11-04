"use client";

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
    <div className="gap-6 flex flex-col">
      <div className="flex-1">
        <label className="block text-sm font-medium text-zinc-500 mb-1">
          Select Amenities
        </label>
        <div className="grid grid-cols-5 gap-2 md:grid-cols-2">
          {amenitiesData.map((amenity, index) => (
            <Button
            variant={"ghost"}
              key={index}
              className={`flex items-center justify-between p-2 border rounded-md ${
                value.includes(amenity.label)
                  ? " border-orange-300 bg-orange-50"
                  : "white border-gray-300"
              } hover:bg-orange-100 hover:border-orange-400`}
              onClick={() => handleToggleTag(amenity)}
            >
              <span className="mr-2 text-orange-500">{<amenity.icon />}</span>
              <span>{amenity.label}</span>
            </Button>
          ))}
        </div>
      </div>
      <div className="flex-1">
        <label className="block text-sm font-medium text-zinc-500 mb-1">
          {label}
        </label>
        <div className="flex flex-wrap items-center border rounded-md p-3 gap-4">
          {value.map((tag, index) => {
            const amenity = amenitiesData.find(
              (amenity) => amenity.label === tag
            );
            return (
              <div
                key={index}
                className="flex items-center rounded-sm border justify-between relative px-4 py-2"
              >
                <div className="text-sm text-gray-400 flex items-center gap-3">
                  <span className="text-orange-500">{amenity && <amenity.icon />}</span>
                  <p className="text-[10px]">{tag}</p>
                </div>

                <button
                  onClick={() => handleToggleTag(amenity!)}
                  className="absolute -right-2 -top-1 bg-orange-400 text-white w-4 h-4 rounded-full text-[8px] border border-white flex items-center justify-center"
                >
                  X
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
