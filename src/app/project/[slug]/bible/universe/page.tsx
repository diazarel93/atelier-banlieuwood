"use client";

import { useParams } from "next/navigation";
import { useUniverse, useAddUniverseItem, useDeleteUniverseItem } from "@/hooks/use-universe";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { PageSkeleton } from "@/components/ui/page-skeleton";
import { useState } from "react";
import { toast } from "sonner";

export default function UniversePage() {
  const params = useParams();
  const slug = params.slug as string;
  const { data: universe, isLoading } = useUniverse(slug);
  const addItem = useAddUniverseItem(slug);
  const deleteItem = useDeleteUniverseItem(slug);

  // Location form
  const [locName, setLocName] = useState("");
  const [locDesc, setLocDesc] = useState("");
  const [locType, setLocType] = useState("");

  // Rule form
  const [ruleTitle, setRuleTitle] = useState("");
  const [ruleDesc, setRuleDesc] = useState("");

  // Timeline form
  const [eventTitle, setEventTitle] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventDesc, setEventDesc] = useState("");

  const handleAddLocation = async () => {
    if (!locName.trim()) return;
    try {
      await addItem.mutateAsync({
        type: "location",
        name: locName,
        description: locDesc,
        type_: locType,
        atmosphere: "",
        notes: "",
      });
      toast.success("Lieu ajoute");
      setLocName("");
      setLocDesc("");
      setLocType("");
    } catch {
      toast.error("Erreur lors de l'ajout du lieu");
    }
  };

  const handleAddRule = async () => {
    if (!ruleTitle.trim()) return;
    try {
      await addItem.mutateAsync({
        type: "rule",
        title: ruleTitle,
        description: ruleDesc,
        category: "",
      });
      toast.success("Regle ajoutee");
      setRuleTitle("");
      setRuleDesc("");
    } catch {
      toast.error("Erreur lors de l'ajout de la regle");
    }
  };

  const handleAddEvent = async () => {
    if (!eventTitle.trim()) return;
    try {
      await addItem.mutateAsync({
        type: "timeline",
        title: eventTitle,
        date: eventDate,
        description: eventDesc,
        characters: [],
      });
      toast.success("Evenement ajoute");
      setEventTitle("");
      setEventDate("");
      setEventDesc("");
    } catch {
      toast.error("Erreur lors de l'ajout de l'evenement");
    }
  };

  if (isLoading) {
    return <PageSkeleton variant="grid" count={4} />;
  }

  return (
    <div className="space-y-8">
      <h2 className="text-lg font-semibold">Univers</h2>

      {/* Locations */}
      <section className="space-y-4">
        <h3 className="font-medium">Lieux</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {universe?.locations.map((loc) => (
            <Card key={loc.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">{loc.name}</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs text-destructive"
                    onClick={() =>
                      deleteItem.mutate({ type: "location", id: loc.id })
                    }
                  >
                    x
                  </Button>
                </div>
                {loc.type && (
                  <Badge variant="outline" className="w-fit text-[10px]">
                    {loc.type}
                  </Badge>
                )}
              </CardHeader>
              {loc.description && (
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {loc.description}
                  </p>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
        <div className="flex flex-col sm:flex-row gap-2 items-end">
          <Input
            value={locName}
            onChange={(e) => setLocName(e.target.value)}
            placeholder="Nom du lieu"
            className="flex-1"
          />
          <Input
            value={locType}
            onChange={(e) => setLocType(e.target.value)}
            placeholder="Type"
            className="sm:w-32"
          />
          <Input
            value={locDesc}
            onChange={(e) => setLocDesc(e.target.value)}
            placeholder="Description"
            className="flex-1"
          />
          <Button size="sm" onClick={handleAddLocation} disabled={addItem.isPending}>
            Ajouter
          </Button>
        </div>
      </section>

      <Separator />

      {/* Rules */}
      <section className="space-y-4">
        <h3 className="font-medium">Regles du monde</h3>
        <div className="space-y-2">
          {universe?.rules.map((rule) => (
            <Card key={rule.id}>
              <CardContent className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium text-sm">{rule.title}</p>
                  {rule.description && (
                    <p className="text-sm text-muted-foreground">
                      {rule.description}
                    </p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs text-destructive"
                  onClick={() =>
                    deleteItem.mutate({ type: "rule", id: rule.id })
                  }
                >
                  x
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Input
            value={ruleTitle}
            onChange={(e) => setRuleTitle(e.target.value)}
            placeholder="Titre de la regle"
            className="sm:w-48"
          />
          <Input
            value={ruleDesc}
            onChange={(e) => setRuleDesc(e.target.value)}
            placeholder="Description"
            className="flex-1"
          />
          <Button size="sm" onClick={handleAddRule} disabled={addItem.isPending}>
            Ajouter
          </Button>
        </div>
      </section>

      <Separator />

      {/* Timeline */}
      <section className="space-y-4">
        <h3 className="font-medium">Chronologie</h3>
        <div className="relative border-l-2 border-muted-foreground/20 pl-6 space-y-4 ml-3">
          {universe?.timeline.map((event) => (
            <div key={event.id} className="relative">
              <div className="absolute -left-[31px] top-1 w-3 h-3 rounded-full bg-primary" />
              <div className="flex items-start justify-between">
                <div>
                  {event.date && (
                    <p className="text-xs text-muted-foreground font-mono">
                      {event.date}
                    </p>
                  )}
                  <p className="font-medium text-sm">{event.title}</p>
                  {event.description && (
                    <p className="text-sm text-muted-foreground">
                      {event.description}
                    </p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs text-destructive shrink-0"
                  onClick={() =>
                    deleteItem.mutate({ type: "timeline", id: event.id })
                  }
                >
                  x
                </Button>
              </div>
            </div>
          ))}
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Input
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
            placeholder="Date"
            className="sm:w-32"
          />
          <Input
            value={eventTitle}
            onChange={(e) => setEventTitle(e.target.value)}
            placeholder="Evenement"
            className="sm:w-48"
          />
          <Textarea
            value={eventDesc}
            onChange={(e) => setEventDesc(e.target.value)}
            placeholder="Description"
            className="flex-1"
            rows={1}
          />
          <Button size="sm" onClick={handleAddEvent} disabled={addItem.isPending}>
            Ajouter
          </Button>
        </div>
      </section>
    </div>
  );
}
