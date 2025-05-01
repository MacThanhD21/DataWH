import * as React from "react";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function SelectLocal({
  placeholder,
  arrayValues,
  defaultValue,
  onChange = () => {},
}) {
  return (
    <Select onValueChange={onChange} defaultValue={defaultValue}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {arrayValues.map((item, index) => (
            <SelectItem
              key={index}
              value={item.value}
              className="cursor-pointer"
            >
              {item.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
