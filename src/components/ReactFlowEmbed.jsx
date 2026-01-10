import { useMemo } from "react";
import ReactFlow, { Background, Controls, MiniMap } from "reactflow";
import "reactflow/dist/style.css";

/**
 * Use inside markdown:
 * ```reactflow
 * { ...valid JSON... }
 * ```
 *
 * Supported node types:
 * - "group"  : renders as a vertical swimlane column
 * - "card"   : normal node (default)
 *
 * Child nodes must include: data.group = "<groupId>"
 */

const NODE_W = 292;
const NODE_H = 92;

// ---------- UI ----------
function Badge({ children }) {
  return (
    <span className="inline-flex items-center rounded-full border border-neutral-200/70 dark:border-neutral-700/60 bg-white/70 dark:bg-neutral-900/50 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-neutral-700 dark:text-neutral-200">
      {children}
    </span>
  );
}

function CardNode({ data }) {
  const tone = data?.tone || "neutral";

  const toneBar =
    tone === "primary"
      ? "bg-primary"
      : tone === "success"
      ? "bg-emerald-500"
      : tone === "warning"
      ? "bg-amber-500"
      : tone === "danger"
      ? "bg-rose-500"
      : "bg-neutral-300 dark:bg-neutral-700";

  return (
    <div
      className={[
        "relative w-[292px] rounded-2xl",
        "border border-neutral-200/70 dark:border-neutral-800/70",
        "bg-white/95 dark:bg-neutral-950/55",
        "shadow-[0_10px_26px_rgba(15,23,42,0.10)] dark:shadow-[0_10px_26px_rgba(0,0,0,0.50)]",
        "backdrop-blur",
      ].join(" ")}
    >
      <div className={`absolute left-0 top-0 h-full w-1.5 rounded-l-2xl ${toneBar}`} />

      <div className="px-4 py-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[13px] font-semibold leading-snug text-neutral-950 dark:text-neutral-50">
              {data?.title}
            </div>
            {data?.subtitle ? (
              <div className="mt-1 text-[11.5px] leading-snug text-neutral-600 dark:text-neutral-300/90">
                {data.subtitle}
              </div>
            ) : null}
          </div>

          {data?.meta ? <Badge>{data.meta}</Badge> : null}
        </div>
      </div>
    </div>
  );
}

function LaneNode({ data }) {
  return (
    <div className="h-full w-full rounded-[28px] border border-neutral-200/70 dark:border-neutral-800/70 bg-white/45 dark:bg-neutral-950/25 shadow-sm">
      <div className="px-5 pt-4 pb-3">
        <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-neutral-500 dark:text-neutral-400">
          {data?.label}
        </div>
        {data?.hint ? (
          <div className="mt-1 text-[11px] leading-snug text-neutral-500/90 dark:text-neutral-400/90">
            {data.hint}
          </div>
        ) : null}
      </div>

      <div className="mx-5 h-px bg-neutral-200/70 dark:bg-neutral-800/70" />
    </div>
  );
}

const nodeTypes = {
  card: CardNode,
  group: LaneNode,
};

function safeParseJSON(text) {
  // Handles common “JSON pasted with trailing garbage” issues.
  // We only try to parse the first complete JSON object.
  const s = String(text || "").trim();

  // If user pasted multiple objects or extra text after JSON, slice from first "{" to last "}"
  const first = s.indexOf("{");
  const last = s.lastIndexOf("}");
  if (first === -1 || last === -1 || last <= first) {
    throw new Error("No JSON object found. Make sure the diagram is valid JSON.");
  }
  const candidate = s.slice(first, last + 1);

  return JSON.parse(candidate);
}

function orderChildren(nodes, edges, groupId) {
  // A simple “best effort” ordering:
  // 1) keep input order, but
  // 2) if edges define a chain inside the same group, lightly bias by indegree.
  const kids = nodes.filter((n) => n.type !== "group" && n.data?.group === groupId);

  const inGroupEdges = edges.filter(
    (e) =>
      kids.some((k) => k.id === e.source) &&
      kids.some((k) => k.id === e.target)
  );

  const indeg = new Map(kids.map((k) => [k.id, 0]));
  for (const e of inGroupEdges) indeg.set(e.target, (indeg.get(e.target) || 0) + 1);

  return [...kids].sort((a, b) => (indeg.get(a.id) || 0) - (indeg.get(b.id) || 0));
}

export default function ReactFlowEmbed({ jsonText }) {
  const parsed = useMemo(() => {
    try {
      const obj = safeParseJSON(jsonText);
      return { ok: true, data: obj };
    } catch (e) {
      return { ok: false, error: String(e?.message || e) };
    }
  }, [jsonText]);

  const prepared = useMemo(() => {
    if (!parsed.ok) return null;

    const cfg = parsed.data || {};
    const layout = cfg.layout || {};

    // Swimlane sizing (Google-ish)
    const laneWidth = Number.isFinite(layout.laneWidth) ? layout.laneWidth : 360;
    const laneGap = Number.isFinite(layout.laneGap) ? layout.laneGap : 56;
    const lanePadTop = Number.isFinite(layout.lanePadTop) ? layout.lanePadTop : 86;
    const lanePadBottom = Number.isFinite(layout.lanePadBottom) ? layout.lanePadBottom : 42;
    const nodeGapY = Number.isFinite(layout.nodeGapY) ? layout.nodeGapY : 34;
    const laneInsetX = Number.isFinite(layout.laneInsetX) ? layout.laneInsetX : 34;

    // Normalize nodes
    const rawNodes = (cfg.nodes || []).map((n) => ({
      id: n.id,
      type: n.type || "card",
      data: n.data || {},
    }));

    // Normalize edges
    const rawEdges = (cfg.edges || []).map((e, idx) => ({
      id: e.id || `e-${idx}-${e.source}-${e.target}`,
      source: e.source,
      target: e.target,
      type: e.type || "smoothstep",
      animated: !!e.animated,
      label: e.label,
      markerEnd: { type: "arrowclosed" },
      style: {
        strokeWidth: e.strokeWidth ?? 1.6,
        strokeDasharray: e.dashed ? "6 6" : undefined,
        opacity: 0.9,
      },
      labelBgPadding: [8, 4],
      labelBgBorderRadius: 999,
      labelBgStyle: { fill: "rgba(255,255,255,0.92)" },
    }));

    // Lanes = "group" nodes, in the order given
    const lanes = rawNodes.filter((n) => n.type === "group");
    const cards = rawNodes.filter((n) => n.type !== "group");

    // Compute lane heights based on children count
    const laneChildren = new Map();
    for (const lane of lanes) {
      laneChildren.set(lane.id, orderChildren(cards, rawEdges, lane.id));
    }

    // Place lanes side-by-side
    const lanePositions = new Map();
    lanes.forEach((lane, i) => {
      lanePositions.set(lane.id, {
        x: i * (laneWidth + laneGap),
        y: 0,
      });
    });

    // Build final nodes: lanes first (behind), then children inside lane
    const finalNodes = [];

    for (const lane of lanes) {
      const kids = laneChildren.get(lane.id) || [];
      const laneHeight =
        lanePadTop +
        (kids.length ? kids.length * NODE_H + (kids.length - 1) * nodeGapY : 0) +
        lanePadBottom;

      finalNodes.push({
        id: lane.id,
        type: "group",
        data: lane.data,
        position: lanePositions.get(lane.id),
        style: {
          width: laneWidth,
          height: Math.max(260, laneHeight),
          zIndex: 0,
        },
        selectable: false,
        draggable: false,
      });

      kids.forEach((k, idx) => {
        finalNodes.push({
          id: k.id,
          type: k.type || "card",
          data: k.data,
          parentNode: lane.id,
          extent: "parent",
          position: {
            x: laneInsetX,
            y: lanePadTop + idx * (NODE_H + nodeGapY),
          },
          style: { zIndex: 10 },
          selectable: false,
          draggable: false,
        });
      });
    }

    // Cards without a lane -> place after lanes in a separate column
    const ungrouped = cards.filter((c) => !c.data?.group);
    if (ungrouped.length) {
      const baseX = lanes.length * (laneWidth + laneGap);
      ungrouped.forEach((k, idx) => {
        finalNodes.push({
          id: k.id,
          type: k.type || "card",
          data: k.data,
          position: { x: baseX, y: lanePadTop + idx * (NODE_H + nodeGapY) },
          selectable: false,
          draggable: false,
        });
      });
    }

    return {
      title: cfg.title,
      caption: cfg.caption,
      height: cfg.height || 560,
      nodes: finalNodes,
      edges: rawEdges,
    };
  }, [parsed]);

  if (!parsed.ok) {
    return (
      <div className="my-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-200">
        <div className="font-semibold">ReactFlow JSON parse error</div>
        <div className="mt-1 font-mono text-xs opacity-90">{parsed.error}</div>
        <div className="mt-2 text-xs opacity-80">
          Tip: Wrap the JSON in <span className="font-mono">```reactflow</span> and remove trailing commas / extra text.
        </div>
      </div>
    );
  }

  return (
    <div className="my-7">
      {prepared?.title ? (
        <div className="mb-2 flex items-baseline justify-between gap-3">
          <div className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">
            {prepared.title}
          </div>
          {prepared?.caption ? (
            <div className="text-xs text-neutral-500 dark:text-neutral-400">{prepared.caption}</div>
          ) : null}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-3xl border border-neutral-200/70 dark:border-neutral-800/70 bg-white dark:bg-neutral-950/35 shadow-sm">
        <div style={{ height: prepared?.height || 560 }}>
          <ReactFlow
            nodes={prepared.nodes}
            edges={prepared.edges}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: 0.22 }}
            nodesDraggable={false}
            nodesConnectable={false}
            elementsSelectable={false}
            proOptions={{ hideAttribution: true }}
            defaultEdgeOptions={{
              type: "smoothstep",
              markerEnd: { type: "arrowclosed" },
              style: { strokeWidth: 1.6, opacity: 0.9 },
            }}
          >
            <Background gap={18} size={1} />
            <Controls showInteractive={false} />
            <MiniMap pannable zoomable />
          </ReactFlow>
        </div>
      </div>
    </div>
  );
}
