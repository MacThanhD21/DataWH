"use client";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useState } from "react";

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
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-eraser-icon lucide-eraser"
                  >
                    <path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21" />
                    <path d="M22 21H7" />
                    <path d="m5 11 9 9" />
                  </svg>
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
                <Button variant="outline" className="!w-full">
                  <div className="!w-[max-content] flex items-center justify-center gap-2">
                    {filterSelection[filterKey].includes(option) && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-check-icon lucide-check"
                      >
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                    )}
                    {option}
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
