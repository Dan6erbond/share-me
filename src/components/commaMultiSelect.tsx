import { MultiSelect, MultiSelectProps } from "@mantine/core";
import { useState } from "react";

interface CommaMultiSelectProps extends Omit<MultiSelectProps, "searchValue"> {
  setData: (setter: (data: string[]) => string[]) => void;
  value: string[];
  onChange: (data: string[]) => void;
}

function CommaMultiSelect({
  value,
  onChange,
  setData,
  ...props
}: CommaMultiSelectProps) {
  const [searchValue, setSearchValue] = useState("");

  return (
    <MultiSelect
      searchable
      value={value}
      onChange={onChange}
      creatable
      getCreateLabel={(query) => `+ Add ${query}`}
      searchValue={searchValue}
      onSearchChange={(query) => {
        if (query.endsWith(",")) {
          setData((data: string[]) => [...data, query.slice(0, -1)]);
          onChange([...value, query.slice(0, -1)]);
          setSearchValue("");
        } else {
          setSearchValue(query);
        }
      }}
      onCreate={(query) => {
        setData((data: string[]) => [...data, query]);
        return query;
      }}
      {...props}
    />
  );
}

export default CommaMultiSelect;
