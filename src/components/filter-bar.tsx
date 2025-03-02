"use client";

import { FilterBarProps } from "@/types/emoji";
export function FilterBar({ 
  sortBy, 
  onSortChange, 
  selectedModel
}: FilterBarProps) {
  // Define filter options
  const sortOptions = [
    { value: "newest", label: "Newest" },
    { value: "popular", label: "Popular" },
    { value: "quality", label: "Quality" }
  ];

  const handleSortClick = (value: string) => {
    if (value !== sortBy) {
      onSortChange(value);
    }
  };


  // Helper function to render filter boxes
  const renderFilterBoxes = (
    options: {value: string, label: string}[], 
    selectedValue: string | null,
    handleClick: (value: string) => void
  ) => {
    return options.map((option) => {
      const isSelected = 
        option.value === selectedValue || 
        (option.value === "all_colors" && selectedValue === null) ||
        (option.value === "all_models" && selectedModel === null);
      
      return (
        <button
          key={option.value}
          onClick={() => handleClick(option.value)}
          className={`
            px-6 py-2 rounded-full border border-border
            ${isSelected ? 'bg-primary text-primary-foreground' : 'bg-background text-foreground hover:bg-muted'}
            transition-colors
          `}
        >
          {option.label}
        </button>
      );
    });
  };

  return (
    <div className="w-full space-y-6">
      {/* Sort options */}
      <div className="flex overflow-x-auto pb-2 hide-scrollbar">
        <div className="flex flex-nowrap gap-3 min-w-max">
          {renderFilterBoxes(
            sortOptions,
            sortBy,
            handleSortClick
          )}
        </div>
      </div>
      
    </div>
  );
}