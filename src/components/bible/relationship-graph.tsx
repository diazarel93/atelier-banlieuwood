"use client";

import { useEffect, useRef } from "react";
import type { Character } from "@/lib/models/character";
import type { Relationship } from "@/lib/models/relationship";

const TYPE_COLORS: Record<string, string> = {
  "allié": "#10b981",
  rival: "#ef4444",
  amour: "#ec4899",
  famille: "#f59e0b",
  mentor: "#8b5cf6",
  neutre: "#6b7280",
};

interface RelationshipGraphProps {
  characters: Character[];
  relationships: Relationship[];
}

interface Node {
  id: string;
  label: string;
  color: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export function RelationshipGraph({
  characters,
  relationships,
}: RelationshipGraphProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodesRef = useRef<Node[]>([]);
  const animRef = useRef<number>(0);
  const dragRef = useRef<{ nodeId: string | null; offsetX: number; offsetY: number }>({
    nodeId: null,
    offsetX: 0,
    offsetY: 0,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.offsetWidth;
    const height = canvas.offsetHeight;
    canvas.width = width * 2;
    canvas.height = height * 2;
    ctx.scale(2, 2);

    // Init nodes
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.3;

    nodesRef.current = characters.map((c, i) => {
      const angle = (i / characters.length) * Math.PI * 2;
      return {
        id: c.id,
        label: c.name,
        color: c.color,
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
        vx: 0,
        vy: 0,
      };
    });

    const nodes = nodesRef.current;

    function getNode(id: string) {
      return nodes.find((n) => n.id === id);
    }

    function simulate() {
      // Repulsion
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[j].x - nodes[i].x;
          const dy = nodes[j].y - nodes[i].y;
          const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 1);
          const force = 2000 / (dist * dist);
          nodes[i].vx -= (dx / dist) * force;
          nodes[i].vy -= (dy / dist) * force;
          nodes[j].vx += (dx / dist) * force;
          nodes[j].vy += (dy / dist) * force;
        }
      }

      // Attraction (edges)
      for (const rel of relationships) {
        const a = getNode(rel.characterA);
        const b = getNode(rel.characterB);
        if (!a || !b) continue;
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 1);
        const force = (dist - 150) * 0.01;
        a.vx += (dx / dist) * force;
        a.vy += (dy / dist) * force;
        b.vx -= (dx / dist) * force;
        b.vy -= (dy / dist) * force;
      }

      // Center gravity
      for (const node of nodes) {
        node.vx += (centerX - node.x) * 0.001;
        node.vy += (centerY - node.y) * 0.001;
      }

      // Apply velocity
      for (const node of nodes) {
        if (dragRef.current.nodeId === node.id) continue;
        node.vx *= 0.9;
        node.vy *= 0.9;
        node.x += node.vx;
        node.y += node.vy;
        // Bounds
        node.x = Math.max(30, Math.min(width - 30, node.x));
        node.y = Math.max(30, Math.min(height - 30, node.y));
      }
    }

    function draw() {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);

      // Draw edges
      for (const rel of relationships) {
        const a = getNode(rel.characterA);
        const b = getNode(rel.characterB);
        if (!a || !b) continue;

        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = TYPE_COLORS[rel.type] || TYPE_COLORS.neutre;
        ctx.lineWidth = 1 + rel.tension * 0.3;
        ctx.stroke();

        // Label
        const midX = (a.x + b.x) / 2;
        const midY = (a.y + b.y) / 2;
        if (rel.label) {
          ctx.fillStyle = "#888";
          ctx.font = "10px sans-serif";
          ctx.textAlign = "center";
          ctx.fillText(rel.label || rel.type, midX, midY - 4);
        }
      }

      // Draw nodes
      for (const node of nodes) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, 20, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.fill();
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = "#fff";
        ctx.font = "bold 10px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        // Show initials
        const initials = node.label
          .split(" ")
          .map((w) => w[0])
          .join("")
          .toUpperCase()
          .slice(0, 2);
        ctx.fillText(initials, node.x, node.y);

        // Name below
        ctx.fillStyle = "#333";
        ctx.font = "11px sans-serif";
        ctx.fillText(node.label, node.x, node.y + 30);
      }
    }

    function loop() {
      simulate();
      draw();
      animRef.current = requestAnimationFrame(loop);
    }

    loop();

    // Drag handlers
    const handleMouseDown = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      for (const node of nodes) {
        const dx = mx - node.x;
        const dy = my - node.y;
        if (dx * dx + dy * dy < 400) {
          dragRef.current = { nodeId: node.id, offsetX: dx, offsetY: dy };
          break;
        }
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!dragRef.current.nodeId) return;
      const rect = canvas.getBoundingClientRect();
      const node = getNode(dragRef.current.nodeId);
      if (!node) return;
      node.x = e.clientX - rect.left - dragRef.current.offsetX;
      node.y = e.clientY - rect.top - dragRef.current.offsetY;
      node.vx = 0;
      node.vy = 0;
    };

    const handleMouseUp = () => {
      dragRef.current.nodeId = null;
    };

    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseup", handleMouseUp);

    return () => {
      cancelAnimationFrame(animRef.current);
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseup", handleMouseUp);
    };
  }, [characters, relationships]);

  if (characters.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 text-muted-foreground">
        Creez des personnages pour voir le graphe de relations.
      </div>
    );
  }

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-[500px] rounded-lg border bg-card/50 backdrop-blur-sm"
    />
  );
}
