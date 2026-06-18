"use client";

import {
  Command,
  CommandInput,
  CommandItem,
  CommandList,
} from "cmdk";

type Item = {
  id: number;
  name_th: string;
};

type Props = {
  items: Item[];
  placeholder: string;
  value: string;
  onSelect: (value: string) => void;
};

export default function AddressSearch({
  items,
  placeholder,
  value,
  onSelect,
}: Props) {
  return (
    <div className="border rounded-xl bg-white">
      <Command>
        <CommandInput
          placeholder={placeholder}
        />

        <CommandList className="max-h-60 overflow-auto">
          {items.map((item) => (
            <CommandItem
              key={item.id}
              value={item.name_th}
              onSelect={() =>
                onSelect(item.name_th)
              }
            >
              {item.name_th}
            </CommandItem>
          ))}
        </CommandList>
      </Command>

      {value && (
        <div className="px-4 py-2 text-sm text-blue-600 font-medium">
          ✓ {value}
        </div>
      )}
    </div>
  );
}