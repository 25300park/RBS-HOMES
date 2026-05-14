"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Spinner from "@/components/ui/spinner";
import { useLoading } from "@/hooks/use-loading";
import UnitCard from "./unit-card";
import Pagination from "@/components/ui/pagination";
import Link from "next/link";
import { generatePropertySlug } from "@/lib/utils";

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

const UnitListPagination = () => {
  const [units, setUnits] = useState<Unit[]>([]);
  const [totalUnit, setTotalUnit] = useState<number>(0);
  const [page, setPage] = useState(1); // Page state
  const [totalPages, setTotalPages] = useState(1); // Total pages state
  const { isLoading, startLoading, stopLoading } = useLoading();
  const searchParams = useSearchParams();

  const limit = 14; // Number of units per page

  const fetchUnits = async (page: number) => {
    startLoading();
    const query = searchParams.toString();
    try {
      const response = await fetch(
        `/api/units?page=${page}&limit=${limit}&${query}`
      );
      const data = await response.json();

      setUnits(data.units); // Overwrite with new data
      setTotalUnit(data.total); // Set total number of units
      setTotalPages(Math.ceil(data.total / limit)); // Calculate total pages
    } catch (error) {
      console.error("Error fetching units:", error);
    } finally {
      stopLoading();
    }
  };

  // Fetch units when page changes
  useEffect(() => {
    fetchUnits(page);
  }, [page, searchParams]); // Also fetch when searchParams change

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage); // Set the new page
    }
  };

  return (
    <div className="container mx-auto py-6 min-h-[calc(100vh-5rem)]">
      {totalUnit} units found
      {isLoading ? (
        <div className="flex justify-center mt-6 items-center">
          <Spinner />
          <span className="ml-2 text-blue-500">Loading units...</span>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-6">
          {units.map((unit) => (
            <Link key={unit.id} href={`/properties/${generatePropertySlug(unit)}`}>
              <UnitCard unit={unit} />
            </Link>
          ))}
        </div>
      )}
      {/* Pagination */}
      <div className="my-10">
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
};

export default UnitListPagination;
