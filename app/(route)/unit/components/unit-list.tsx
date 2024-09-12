"use client";

import React, { useState, useEffect } from "react";
import Spinner from "@/components/ui/spinner";
import { useObserver } from "@/hooks/use-observer";
import { useLoading } from "@/hooks/use-loading";
import UnitCard from "./unit-card";

interface Unit {
  id: number;
  title: string;
  type: string;
  sellType: string;
  fullAddress: string;
  address2: string | null;
  address3: string | null;
  area: number;
  price: number | null;
  ownerName: string;
  images: string[];
  bed: number | null;
  bath: number | null;
  parking: number | null;
  note: string | null;
  admin: {
    id: number;
    username: string | null;
    email: string | null;
    image: string | null;
    level: number;
    name: string | null;
    mobile: string | null;
    facebook: string | null;
    status: number;
    license: string | null;
    company: string | null;
  };
}

const UnitList: React.FC = () => {
  const [units, setUnits] = useState<Unit[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { isLoading, startLoading, stopLoading } = useLoading();

  const fetchUnits = async () => {
    startLoading();
    const limit = 10;
    try {
      const response = await fetch(`/api/units?page=${page}&limit=${limit}`);
      const data = await response.json();

      setUnits((prevUnits) => [...prevUnits, ...data.units]);
      setHasMore(
        data.units.length > 0 && units.length + data.units.length < data.total
      );

      setTimeout(() => {
        stopLoading();
      }, 500); // 500ms 딜레이
    } catch (error) {
      console.error("Error fetching units:", error);
      stopLoading(); // 오류 발생 시 즉시 로딩 종료
    }
  };

  useEffect(() => {
    fetchUnits();
  }, [page]);

  const { lastElementRef } = useObserver(
    () => {
      if (hasMore && !isLoading) {
        setPage((prevPage) => prevPage + 1);
      }
    },
    hasMore,
    isLoading
  );

  return (
    <div className="container mx-auto py-6">
      아이콘, 블랙으로 디자인 새롭게
      <div className="grid grid-cols-2  gap-6">
        {units.map((unit, index) => (
          <div
            key={unit.id + Math.random()}
            ref={units.length === index + 1 ? lastElementRef : null}
          >
            <UnitCard unit={unit} />
          </div>
        ))}
      </div>
      {isLoading && (
        <div className="flex justify-center mt-6 items-center">
          <Spinner />
          <span className="ml-2 text-blue-500">Loading more units...</span>
        </div>
      )}
    </div>
  );
};

export default UnitList;
