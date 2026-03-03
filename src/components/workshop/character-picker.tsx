"use client";

import { useCharacters } from "@/hooks/use-characters";
import { Badge } from "@/components/ui/badge";

interface CharacterPickerProps {
  slug: string;
  selected: string[];
  onChange: (ids: string[]) => void;
  min?: number;
  max?: number;
}

export function CharacterPicker({
  slug,
  selected,
  onChange,
  min = 1,
  max = 5,
}: CharacterPickerProps) {
  const { data: characters, isLoading } = useCharacters(slug);

  const toggle = (id: string) => {
    if (selected.includes(id)) {
      if (selected.length > min) {
        onChange(selected.filter((s) => s !== id));
      }
    } else if (selected.length < max) {
      onChange([...selected, id]);
    }
  };

  if (isLoading) {
    return (
      <div className="text-sm text-muted-foreground">
        Chargement des personnages...
      </div>
    );
  }

  if (!characters?.length) {
    return (
      <div className="text-sm text-muted-foreground">
        Aucun personnage. Creez-en dans la Bible.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {characters.map((char) => {
          const isSelected = selected.includes(char.id);
          return (
            <button
              key={char.id}
              type="button"
              onClick={() => toggle(char.id)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border transition-colors ${
                isSelected
                  ? "border-primary bg-primary/10 font-medium"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: char.color }}
              />
              {char.name}
              {char.role && (
                <Badge variant="secondary" className="text-[10px] px-1 py-0">
                  {char.role}
                </Badge>
              )}
            </button>
          );
        })}
      </div>
      <p className="text-xs text-muted-foreground">
        {selected.length}/{max} personnages selectionnes
        {min > 0 && ` (min ${min})`}
      </p>
    </div>
  );
}
