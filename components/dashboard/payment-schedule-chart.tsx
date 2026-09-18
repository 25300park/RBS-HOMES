"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaymentScheduleChartProps {
  title?: string;
  subtitle?: string;
  totalPaidCount?: number;
  monthlyRent?: number;
  totalContractYears?: number; // 1, 2, 3 years
  userType?: "tenant" | "landlord";
}

export function PaymentScheduleChart({
  title = "Rental Revenue",
  subtitle = "12-Month Lease Payment Status",
  totalPaidCount = 5,
  monthlyRent = 45000,
  totalContractYears = 2, // default 2 years (supports 1, 2, 3+ years)
  userType = "landlord",
}: PaymentScheduleChartProps) {
  const [currentYear, setCurrentYear] = useState(1);

  const handlePrevYear = () => {
    if (currentYear > 1) {
      setCurrentYear((prev) => prev - 1);
    }
  };

  const handleNextYear = () => {
    if (currentYear < totalContractYears) {
      setCurrentYear((prev) => prev + 1);
    }
  };

  // Base month labels
  const monthNames = ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep"];

  // Generate 12 months data dynamically based on currentYear
  const monthsData = monthNames.map((month, idx) => {
    const globalMonthIndex = (currentYear - 1) * 12 + (idx + 1);
    const monthCode = `M${globalMonthIndex}`;

    let status: "PAID" | "CURRENT" | "UPCOMING" = "UPCOMING";
    if (currentYear === 1) {
      if (idx < totalPaidCount) {
        status = "PAID";
      } else if (idx === totalPaidCount) {
        status = "CURRENT";
      } else {
        status = "UPCOMING";
      }
    } else {
      status = "UPCOMING";
    }

    return {
      month,
      code: monthCode,
      status,
    };
  });

  const settledAmount = currentYear === 1 ? totalPaidCount * monthlyRent : 0;
  const annualTotal = 12 * monthlyRent;

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-zinc-200/80 space-y-5">
      {/* Header & Optional Multi-Year Arrow Navigator */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base sm:text-lg font-extrabold text-zinc-900">{title}</h2>
          <p className="text-xs text-zinc-500 font-medium">{subtitle}</p>
        </div>

        {/* Show Year Selector with Arrows ONLY if contract is more than 1 year */}
        {totalContractYears > 1 && (
          <div className="flex items-center gap-1 bg-zinc-100/90 border border-zinc-200/80 px-2 py-1 rounded-xl text-xs font-bold text-zinc-700">
            <button
              type="button"
              onClick={handlePrevYear}
              disabled={currentYear <= 1}
              className={`p-1 rounded-lg transition-colors ${
                currentYear <= 1
                  ? "text-zinc-300 cursor-not-allowed"
                  : "text-zinc-600 hover:bg-white hover:text-blue-600 shadow-2xs"
              }`}
              title="Previous Year"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            <span className="px-2 text-zinc-900 font-extrabold text-[11px] select-none min-w-[50px] text-center">
              Year {currentYear}
            </span>

            <button
              type="button"
              onClick={handleNextYear}
              disabled={currentYear >= totalContractYears}
              className={`p-1 rounded-lg transition-colors ${
                currentYear >= totalContractYears
                  ? "text-zinc-300 cursor-not-allowed"
                  : "text-zinc-600 hover:bg-white hover:text-blue-600 shadow-2xs"
              }`}
              title="Next Year"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Amount Summary in English */}
      <div className="flex items-baseline justify-between border-b border-zinc-100 pb-3">
        <div>
          <div className="text-2xl sm:text-3xl font-black text-blue-600 tracking-tight">
            ₱{settledAmount.toLocaleString()}
          </div>
          <p className="text-[11px] text-zinc-500 font-medium mt-0.5">
            {currentYear === 1
              ? `${totalPaidCount} of 12 months settled (₱${monthlyRent.toLocaleString()}/mo)`
              : `Year ${currentYear} scheduled collection`}
          </p>
        </div>
        <div className="text-right">
          <span className="text-[11px] text-zinc-400 font-semibold block">Annual Term Total</span>
          <span className="text-sm font-bold text-zinc-800">₱{annualTotal.toLocaleString()}</span>
        </div>
      </div>

      {/* 12-Month Uniform Bar Chart (No legend as requested) */}
      <div className="pt-2">
        <div className="grid grid-cols-12 gap-1.5 sm:gap-2 h-24 items-end">
          {monthsData.map((m, idx) => {
            const isPaid = m.status === "PAID";
            const isCurrent = m.status === "CURRENT";

            return (
              <div key={idx} className="flex flex-col items-center gap-1.5 h-full justify-end group">
                {/* Uniform Height Bar with Colors */}
                <div
                  className={`w-full h-16 rounded-lg transition-all relative ${
                    isCurrent
                      ? "bg-blue-600 shadow-md shadow-blue-500/30 ring-2 ring-blue-600/30"
                      : isPaid
                      ? "bg-blue-200/90 hover:bg-blue-300"
                      : "bg-zinc-200 hover:bg-zinc-300"
                  }`}
                  title={`${m.month} (${m.code}): ${
                    isCurrent ? "Current Due Month" : isPaid ? "Settled" : "Upcoming"
                  }`}
                >
                  {isCurrent && (
                    <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] font-black text-blue-600 uppercase tracking-tighter whitespace-nowrap">
                      Now
                    </span>
                  )}
                </div>

                {/* Month Label */}
                <span
                  className={`text-[10px] font-bold ${
                    isCurrent
                      ? "text-blue-600 font-black"
                      : isPaid
                      ? "text-zinc-600"
                      : "text-zinc-400"
                  }`}
                >
                  {m.month}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
