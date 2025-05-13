"use client";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function PopoverLocal({
  optionArray = [],
  filterKey = "",
  filterSelection = [],
  setFilterSelection = () => {},
}) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      {optionArray.length > 0 &&
      filterKey &&
      filterSelection &&
      setFilterSelection ? (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill={filterSelection[filterKey].length > 0 ? "gray" : "none"}
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-funnel-icon lucide-funnel cursor-pointer"
            >
              <path d="M10 20a1 1 0 0 0 .553.895l2 1A1 1 0 0 0 14 21v-7a2 2 0 0 1 .517-1.341L21.74 4.67A1 1 0 0 0 21 3H3a1 1 0 0 0-.742 1.67l7.225 7.989A2 2 0 0 1 10 14z" />
            </svg>
          </PopoverTrigger>
          <PopoverContent className="w-[max-content] h-[160px] overflow-y-auto p-2 flex flex-col gap-2">
            <div
              key={"clear"}
              onClick={() => {
                setFilterSelection((prev) => {
                  return {
                    ...prev,
                    [filterKey]: [],
                  };
                });
                console.log(filterSelection[filterKey]);
              }}
              className="!min-w-[max-content]"
            >
              <Button variant="outline" className="!w-full">
                <div className="!w-full flex items-center justify-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-red-500"
                  >
                    <path d="M3 6h18" />
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                    <line x1="10" y1="11" x2="10" y2="17" />
                    <line x1="14" y1="11" x2="14" y2="17" />
                  </svg>
                  <span className="text-sm font-medium text-red-500">Xóa tất cả</span>
                </div>
              </Button>
            </div>
            {optionArray.map((option, index) => (
              <div
                key={index}
                onClick={() => {
                  setFilterSelection((prev) => {
                    const currentArray = prev[filterKey] || [];
                    const isSelected = currentArray.includes(option);
                    const updatedArray = isSelected
                      ? currentArray.filter((item) => item !== option)
                      : [...currentArray, option];
                    return {
                      ...prev,
                      [filterKey]: updatedArray,
                    };
                  });
                }}
              >
                <Button 
                  variant="outline" 
                  className={cn(
                    "!w-full transition-all duration-200",
                    filterSelection[filterKey].includes(option) 
                      ? "bg-blue-50 border-blue-200 hover:bg-blue-100" 
                      : "hover:bg-gray-50"
                  )}
                >
                  <div className="!w-[max-content] flex items-center justify-center gap-2">
                    {filterSelection[filterKey].includes(option) ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-blue-600"
                      >
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                    ) : (
                      <div className="w-3.5 h-3.5 rounded-sm border border-gray-300" />
                    )}
                    <span className={cn(
                      "text-sm font-medium",
                      filterSelection[filterKey].includes(option)
                        ? "text-blue-700"
                        : "text-gray-700"
                    )}>
                      {option}
                    </span>
                  </div>
                </Button>
              </div>
            ))}
          </PopoverContent>
        </Popover>
      ) : null}
    </>
  );
}
