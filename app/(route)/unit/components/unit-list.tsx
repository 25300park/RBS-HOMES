"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
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

const UnitList = () => {
  const [units, setUnits] = useState<Unit[]>([]);
  const [totalUnit, setTotalUnit] = useState();
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { isLoading, startLoading, stopLoading } = useLoading();
  const searchParams = useSearchParams();

  const fetchUnits = async (reset = false) => {
    startLoading();
    const limit = 10;
    const query = searchParams.toString();
    try {
      const response = await fetch(
        `/api/units?page=${page}&limit=${limit}&${query}`
      );
      const data = await response.json();

      if (reset) {
        setUnits(data.units); // 필터 변경 시 기존 데이터를 덮어씀
      } else {
        setUnits((prevUnits) => [...prevUnits, ...data.units]); // 스크롤 시 데이터 추가
      }
      setTotalUnit(data.total);
      setHasMore(
        data.units.length > 0 && units.length + data.units.length < data.total
      );
    } catch (error) {
      console.error("Error fetching units:", error);
    } finally {
      setTimeout(stopLoading, 900);
    }
  };

  // 필터 변경 시 동작
  useEffect(() => {
    setPage(1); // 페이지 초기화
    fetchUnits(true); // 필터 변경 시 기존 데이터 초기화
  }, [searchParams]);

  // 페이지 변경(무한 스크롤) 시 동작
  useEffect(() => {
    if (page > 1) {
      fetchUnits(); // 페이지 증가 시 데이터 추가
    }
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
      {totalUnit}
      <div className="grid grid-cols-2 gap-6">
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
