import { useEffect, useMemo, useRef, useState } from 'react';
import * as d3 from 'd3';
import { feature, mesh } from 'topojson-client';
import type { Topology, GeometryCollection } from 'topojson-specification';
import worldAtlas from 'world-atlas/countries-110m.json';
import { Maximize2, Minus, Plus } from 'lucide-react';
import type { Locale, TradeCorridor } from '../types/domain';

interface TradeCorridorMapProps {
  corridors: TradeCorridor[];
  selectedId: string;
  locale: Locale;
  onSelect: (id: string) => void;
  highlightedMode?: TradeCorridor['modeCode'] | 'all';
  showControls?: boolean;
}

interface CorridorGeoRoute {
  originLabel: string;
  waypoints: [number, number][];
}

// Authentic geographic [longitude, latitude] maritime & overland waypoints
const CORRIDOR_GEO_ROUTES: Record<string, CorridorGeoRoute> = {
  'south-asia': {
    originLabel: 'Bandar Abbas',
    waypoints: [
      [56.28, 27.18],
      [57.9, 25.3],
      [64.2, 22.8],
      [72.95, 18.95],
    ],
  },
  'east-asia': {
    originLabel: 'Assaluyeh',
    waypoints: [
      [52.61, 27.47],
      [57.6, 25.2],
      [69.0, 12.5],
      [81.5, 5.2],
      [101.2, 2.6],
      [113.8, 15.8],
      [121.47, 31.23],
    ],
  },
  'cis-caspian': {
    originLabel: 'Amirabad',
    waypoints: [
      [53.38, 36.85],
      [52.3, 40.6],
      [51.17, 43.65],
      [63.5, 44.2],
      [76.89, 43.24],
    ],
  },
  'turkey-europe': {
    originLabel: 'Bazargan',
    waypoints: [
      [44.4, 39.38],
      [38.5, 39.9],
      [32.8, 40.2],
      [28.98, 41.01],
      [28.65, 44.18],
    ],
  },
  'gulf-hub': {
    originLabel: 'Bandar Abbas',
    waypoints: [
      [56.28, 27.18],
      [55.35, 25.45],
      [55.12, 25.02],
      [58.59, 23.61],
    ],
  },
  africa: {
    originLabel: 'Bandar Abbas',
    waypoints: [
      [56.28, 27.18],
      [59.4, 22.4],
      [53.2, 11.4],
      [44.5, 1.5],
      [39.67, -4.04],
      [36.5, -18.5],
      [31.02, -29.85],
    ],
  },
  'south-america': {
    originLabel: 'Assaluyeh',
    waypoints: [
      [52.61, 27.47],
      [58.8, 20.5],
      [51.2, 4.5],
      [43.0, -16.5],
      [31.5, -32.2],
      [18.4, -35.8],
      [-10.5, -32.5],
      [-34.0, -28.0],
      [-46.33, -23.96],
    ],
  },
};

const MODE_COLORS: Record<TradeCorridor['modeCode'], string> = {
  maritime: '#38BDF8',
  caspian: '#2DD4BF',
  overland: '#F59E0B',
  gulf: '#BAE6FD',
};

const WIDTH = 960;
const HEIGHT = 480;

export function TradeCorridorMap({
  corridors,
  selectedId,
  locale,
  onSelect,
  highlightedMode = 'all',
  showControls = true,
}: TradeCorridorMapProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const zoomBehaviorRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  // Extract GeoJSON countries and internal border mesh once via topojson-client
  const geoData = useMemo(() => {
    const topology = worldAtlas as unknown as Topology<{
      countries: GeometryCollection;
      land: GeometryCollection;
    }>;
    const countries = feature(topology, topology.objects.countries);
    const borders = mesh(
      topology,
      topology.objects.countries,
      (a, b) => a !== b,
    );
    const land = feature(topology, topology.objects.land);
    return { countries, borders, land };
  }, []);

  // Build D3 Natural Earth projection centered gracefully on Eurasian / Indian Ocean / Atlantic trade span
  const { projection, pathGen, lineGen } = useMemo(() => {
    const proj = d3
      .geoNaturalEarth1()
      .rotate([-22, 0])
      .fitExtent(
        [
          [14, 18],
          [WIDTH - 14, HEIGHT - 18],
        ],
        geoData.land,
      );
    const pGen = d3.geoPath(proj);
    const lGen = d3
      .line<[number, number]>()
      .x((d) => d[0])
      .y((d) => d[1])
      .curve(d3.curveCatmullRom.alpha(0.5));
    return { projection: proj, pathGen: pGen, lineGen: lGen };
  }, [geoData.land]);

  // Pre-compute projected SVG path strings and anchor points for all 7 corridors
  const projectedCorridors = useMemo(() => {
    return corridors.map((corridor) => {
      const geo = CORRIDOR_GEO_ROUTES[corridor.id];
      const pts: [number, number][] = (geo?.waypoints || [[56.28, 27.18], [72.95, 18.95]])
        .map((coord) => projection(coord))
        .filter((pt): pt is [number, number] => pt !== null);

      const dPath = lineGen(pts) || '';
      const origin = pts[0] || [WIDTH / 2, HEIGHT / 2];
      const target = pts[pts.length - 1] || [WIDTH / 2, HEIGHT / 2];

      return {
        corridor,
        dPath,
        origin,
        target,
        color: MODE_COLORS[corridor.modeCode],
        originLabel: geo?.originLabel || corridor.loadingPorts[0] || 'Gulf Hub',
      };
    });
  }, [corridors, projection, lineGen]);

  // Initialize static cartographic layers & D3 zoom behavior once
  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const defs = svg.append('defs');

    // Glow filter for active route & moving cargo packets
    const glow = defs
      .append('filter')
      .attr('id', 'd3-corridor-glow')
      .attr('x', '-30%')
      .attr('y', '-30%')
      .attr('width', '160%')
      .attr('height', '160%');
    glow
      .append('feGaussianBlur')
      .attr('stdDeviation', '3.2')
      .attr('result', 'coloredBlur');
    const merge = glow.append('feMerge');
    merge.append('feMergeNode').attr('in', 'coloredBlur');
    merge.append('feMergeNode').attr('in', 'SourceGraphic');

    // Subtle ocean radial depth gradient
    const oceanGrad = defs
      .append('radialGradient')
      .attr('id', 'd3-ocean-radial')
      .attr('cx', '58%')
      .attr('cy', '44%')
      .attr('r', '68%');
    oceanGrad.append('stop').attr('offset', '0%').attr('stop-color', '#0D3344');
    oceanGrad.append('stop').attr('offset', '100%').attr('stop-color', '#051923');

    svg
      .append('rect')
      .attr('width', WIDTH)
      .attr('height', HEIGHT)
      .attr('fill', 'url(#d3-ocean-radial)');

    const viewportGroup = svg.append('g').attr('class', 'map-viewport');

    // 1. Graticule layer
    viewportGroup
      .append('path')
      .datum(d3.geoGraticule10())
      .attr('d', pathGen)
      .attr('fill', 'none')
      .attr('stroke', '#38BDF8')
      .attr('stroke-opacity', 0.08)
      .attr('stroke-width', 0.65);

    // 2. Landmasses layer (Highlight Iran id=364 and UAE id=784 as core origin hub)
    const countriesGroup = viewportGroup.append('g').attr('class', 'countries-layer');
    countriesGroup
      .selectAll('path')
      .data(geoData.countries.features)
      .join('path')
      .attr('d', (d) => pathGen(d) || '')
      .attr('fill', (d) => {
        const id = String(d.id || '');
        if (id === '364' || id === '784') return '#16526B';
        return '#0D2B3A';
      })
      .attr('stroke', (d) => {
        const id = String(d.id || '');
        if (id === '364' || id === '784') return '#38BDF8';
        return 'none';
      })
      .attr('stroke-opacity', 0.45)
      .attr('stroke-width', 0.75);

    // 3. Crisp country border mesh
    viewportGroup
      .append('path')
      .datum(geoData.borders)
      .attr('d', pathGen)
      .attr('fill', 'none')
      .attr('stroke', '#1D4F66')
      .attr('stroke-width', 0.55)
      .attr('stroke-linejoin', 'round');

    // 4. Dedicated dynamic layers for routes, animated particles, nodes & labels
    viewportGroup.append('g').attr('class', 'routes-layer');
    viewportGroup.append('g').attr('class', 'particles-layer');
    viewportGroup.append('g').attr('class', 'nodes-layer');

    // D3 Zoom & Pan behavior
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 3.6])
      .translateExtent([
        [0, 0],
        [WIDTH, HEIGHT],
      ])
      .on('zoom', (event) => {
        viewportGroup.attr('transform', event.transform.toString());
      });

    zoomBehaviorRef.current = zoom;
    svg.call(zoom).on('dblclick.zoom', null);
  }, [geoData, pathGen]);

  // Dynamic D3 update for 7 corridors, animated flow sweeps, moving cargo packets & hover/selection states
  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    const routesLayer = svg.select<SVGGElement>('.routes-layer');
    const particlesLayer = svg.select<SVGGElement>('.particles-layer');
    const nodesLayer = svg.select<SVGGElement>('.nodes-layer');

    routesLayer.selectAll('*').remove();
    particlesLayer.selectAll('*').remove();
    nodesLayer.selectAll('*').remove();

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Sort so selected corridor renders cleanly above inactive corridors
    const sorted = [...projectedCorridors].sort((a, b) => {
      if (a.corridor.id === selectedId) return 1;
      if (b.corridor.id === selectedId) return -1;
      return 0;
    });

    const animatedPaths: {
      node: SVGPathElement;
      totalLength: number;
      isSelected: boolean;
      color: string;
      speed: number;
    }[] = [];

    sorted.forEach((item, idx) => {
      const { corridor, dPath, origin, target, color } = item;
      const isSelected = corridor.id === selectedId;
      const isHovered = corridor.id === hoveredId;
      const matchesMode =
        highlightedMode === 'all' || corridor.modeCode === highlightedMode;

      const groupOpacity = !matchesMode
        ? 0.16
        : isSelected || isHovered
          ? 1
          : 0.65;

      const routeG = routesLayer
        .append('g')
        .attr('class', 'corridor-group')
        .style('cursor', 'pointer')
        .attr('opacity', groupOpacity)
        .on('mouseenter', (event: MouseEvent) => {
          setHoveredId(corridor.id);
          const rect = svgRef.current?.getBoundingClientRect();
          if (rect) {
            setTooltipPos({
              x: event.clientX - rect.left,
              y: event.clientY - rect.top,
            });
          }
        })
        .on('mousemove', (event: MouseEvent) => {
          const rect = svgRef.current?.getBoundingClientRect();
          if (rect) {
            setTooltipPos({
              x: event.clientX - rect.left,
              y: event.clientY - rect.top,
            });
          }
        })
        .on('mouseleave', () => {
          setHoveredId(null);
          setTooltipPos(null);
        })
        .on('click', () => {
          onSelect(corridor.id);
        });

      // Wide invisible hit path for effortless interaction
      routeG
        .append('path')
        .attr('d', dPath)
        .attr('fill', 'none')
        .attr('stroke', 'transparent')
        .attr('stroke-width', 16);

      // Base corridor track
      const basePath = routeG
        .append('path')
        .attr('d', dPath)
        .attr('fill', 'none')
        .attr('stroke', color)
        .attr('stroke-width', isSelected ? 2.6 : isHovered ? 2.0 : 1.25)
        .attr('stroke-linecap', 'round')
        .attr('stroke-opacity', isSelected ? 0.95 : 0.5);

      if (isSelected) {
        basePath.attr('filter', 'url(#d3-corridor-glow)');
      }

      // Smooth D3 draw-in transition on the selected corridor
      const pathNode = basePath.node();
      if (pathNode) {
        const totalLength = pathNode.getTotalLength();
        if (isSelected && !prefersReducedMotion) {
          basePath
            .attr('stroke-dasharray', `${totalLength} ${totalLength}`)
            .attr('stroke-dashoffset', totalLength)
            .transition()
            .duration(650)
            .ease(d3.easeCubicOut)
            .attr('stroke-dashoffset', 0)
            .on('end', () => {
              basePath.attr('stroke-dasharray', null);
            });
        }

        // Animated flowing dashed overlay stream
        routeG
          .append('path')
          .attr('d', dPath)
          .attr('fill', 'none')
          .attr('stroke', isSelected ? '#FFFFFF' : color)
          .attr('stroke-width', isSelected ? 1.5 : 1.1)
          .attr('stroke-dasharray', isSelected ? '7 11' : '3 9')
          .attr('stroke-linecap', 'round')
          .attr('stroke-opacity', isSelected ? 0.9 : 0.45)
          .attr('class', prefersReducedMotion ? '' : 'animate-route-flow');

        if (matchesMode) {
          animatedPaths.push({
            node: pathNode,
            totalLength,
            isSelected,
            color,
            speed: isSelected ? 0.00024 : 0.00013 + idx * 0.000012,
          });
        }
      }

      // Origin & Destination Port Nodes
      const nodeG = nodesLayer
        .append('g')
        .style('cursor', 'pointer')
        .attr('opacity', groupOpacity)
        .on('mouseenter', (event: MouseEvent) => {
          setHoveredId(corridor.id);
          const rect = svgRef.current?.getBoundingClientRect();
          if (rect) {
            setTooltipPos({
              x: event.clientX - rect.left,
              y: event.clientY - rect.top,
            });
          }
        })
        .on('mouseleave', () => {
          setHoveredId(null);
          setTooltipPos(null);
        })
        .on('click', () => {
          onSelect(corridor.id);
        });

      // Origin marker
      nodeG
        .append('circle')
        .attr('cx', origin[0])
        .attr('cy', origin[1])
        .attr('r', isSelected ? 4.5 : 3)
        .attr('fill', '#FFFFFF')
        .attr('stroke', '#0E4D64')
        .attr('stroke-width', 1.6);

      // Destination halo for selected route
      if (isSelected) {
        nodeG
          .append('circle')
          .attr('cx', target[0])
          .attr('cy', target[1])
          .attr('r', 12)
          .attr('fill', '#F59E0B')
          .attr('fill-opacity', 0.22);
      }

      // Destination port marker
      nodeG
        .append('circle')
        .attr('cx', target[0])
        .attr('cy', target[1])
        .attr('r', isSelected ? 5.8 : isHovered ? 5 : 4)
        .attr('fill', isSelected ? '#F59E0B' : '#061E29')
        .attr('stroke', isSelected ? '#FFFFFF' : color)
        .attr('stroke-width', isSelected ? 2 : 1.6);

      // Destination label with subtle dark halo for crisp legibility over coastlines
      const labelOffsetY = corridor.id === 'gulf-hub' ? 16 : -12;
      nodeG
        .append('text')
        .attr('x', target[0])
        .attr('y', target[1] + labelOffsetY)
        .attr('text-anchor', 'middle')
        .attr('font-size', isSelected ? '11.5px' : '9.5px')
        .attr('font-weight', isSelected ? '700' : '500')
        .attr('fill', isSelected ? '#FFFFFF' : '#CBD5E1')
        .attr('stroke', '#051923')
        .attr('stroke-width', 3)
        .attr('paint-order', 'stroke')
        .style('user-select', 'none')
        .text(corridor.region[locale]);
    });

    // Primary Persian Gulf Anchor Label
    const gulfAnchor = projection([55.2, 27.2]);
    if (gulfAnchor) {
      nodesLayer
        .append('text')
        .attr('x', gulfAnchor[0])
        .attr('y', gulfAnchor[1] - 11)
        .attr('text-anchor', 'middle')
        .attr('font-size', '9.5px')
        .attr('font-weight', '700')
        .attr('letter-spacing', '0.05em')
        .attr('fill', '#7DD3FC')
        .attr('stroke', '#051923')
        .attr('stroke-width', 3)
        .attr('paint-order', 'stroke')
        .style('pointer-events', 'none')
        .text(
          locale === 'fa'
            ? 'ترمینال‌های خلیج فارس'
            : locale === 'ar'
              ? 'محطات الخليج العربي'
              : 'PERSIAN GULF HUB',
        );
    }

    // D3.timer animated luminous shipment packets gliding along each active flow path
    if (prefersReducedMotion || animatedPaths.length === 0) return;

    const packets = animatedPaths.flatMap((route) => {
      const count = route.isSelected ? 2 : 1;
      return Array.from({ length: count }, (_, k) => {
        const dot = particlesLayer
          .append('circle')
          .attr('r', route.isSelected ? 3.2 : 2)
          .attr('fill', route.isSelected ? '#FFFFFF' : route.color)
          .attr('fill-opacity', route.isSelected ? 0.95 : 0.7)
          .style('pointer-events', 'none');
        if (route.isSelected) {
          dot.attr('filter', 'url(#d3-corridor-glow)');
        }
        return {
          dot,
          route,
          offset: k / count,
        };
      });
    });

    const timer = d3.timer((elapsed) => {
      packets.forEach(({ dot, route, offset }) => {
        const progress = (elapsed * route.speed + offset) % 1;
        const point = route.node.getPointAtLength(progress * route.totalLength);
        dot.attr('cx', point.x).attr('cy', point.y);
      });
    });

    return () => {
      timer.stop();
    };
  }, [projectedCorridors, selectedId, hoveredId, highlightedMode, locale, onSelect, projection]);

  const handleZoomIn = () => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    d3.select(svgRef.current)
      .transition()
      .duration(220)
      .call(zoomBehaviorRef.current.scaleBy, 1.35);
  };

  const handleZoomOut = () => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    d3.select(svgRef.current)
      .transition()
      .duration(220)
      .call(zoomBehaviorRef.current.scaleBy, 0.75);
  };

  const handleResetZoom = () => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    d3.select(svgRef.current)
      .transition()
      .duration(280)
      .call(zoomBehaviorRef.current.transform, d3.zoomIdentity);
  };

  const hoveredCorridor = hoveredId
    ? corridors.find((c) => c.id === hoveredId) || null
    : null;

  return (
    <div className="relative rounded-2xl overflow-hidden bg-[#051923] border border-white/12 select-none">
      {/* Interactive D3 SVG Canvas */}
      <svg
        ref={svgRef}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="w-full h-auto block touch-pan-y"
        role="img"
        aria-label="Interactive D3.js Global Petrochemical Trade Corridors Map"
      />

      {/* Interactive Zoom Controls */}
      {showControls && (
        <div
          className="absolute top-3.5 end-3.5 flex flex-col gap-1.5 z-10"
          dir="ltr"
        >
          <button
            type="button"
            onClick={handleZoomIn}
            aria-label="Zoom in map"
            className="w-9 h-9 rounded-xl bg-[#061E29]/80 hover:bg-[#0E4D64] text-white border border-white/15 backdrop-blur-md flex items-center justify-center transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleZoomOut}
            aria-label="Zoom out map"
            className="w-9 h-9 rounded-xl bg-[#061E29]/80 hover:bg-[#0E4D64] text-white border border-white/15 backdrop-blur-md flex items-center justify-center transition-colors cursor-pointer"
          >
            <Minus className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleResetZoom}
            aria-label="Reset map zoom"
            className="w-9 h-9 rounded-xl bg-[#061E29]/80 hover:bg-[#0E4D64] text-white border border-white/15 backdrop-blur-md flex items-center justify-center transition-colors cursor-pointer"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Quiet Mode Legend Bar */}
      <div className="px-4 py-2.5 border-t border-white/10 bg-[#04141C]/90 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-300">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-[#38BDF8] inline-block" />
            <span>
              {locale === 'fa' ? 'دریایی اقیانوسی' : locale === 'ar' ? 'بحري محيطي' : 'Maritime Bulk & Container'}
            </span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-[#2DD4BF] inline-block" />
            <span>
              {locale === 'fa' ? 'خزر و ریلی CIS' : locale === 'ar' ? 'قزوين وCIS' : 'Caspian & CIS Rail'}
            </span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-[#F59E0B] inline-block" />
            <span>
              {locale === 'fa' ? 'زمینی TIR' : locale === 'ar' ? 'بري TIR' : 'Overland TIR'}
            </span>
          </span>
        </div>
        <span className="font-mono-data text-slate-400">
          {locale === 'fa'
            ? 'کلیک روی مسیر یا بزرگنمایی با اسکرول'
            : locale === 'ar'
              ? 'انقر على أي ممر أو استخدم التكبير'
              : 'Click any corridor · Drag & zoom'}
        </span>
      </div>

      {/* Dynamic Hover Tooltip */}
      {hoveredCorridor && tooltipPos && (
        <div
          style={{
            left: Math.min(Math.max(tooltipPos.x + 14, 12), 540),
            top: Math.max(tooltipPos.y - 72, 12),
          }}
          className="pointer-events-none absolute z-20 max-w-[260px] rounded-xl bg-[#04151E]/92 backdrop-blur-xl border border-white/20 px-4 py-3 text-white shadow-2xl"
        >
          <div className="flex items-center justify-between gap-3 text-[11px] text-sky-300">
            <span className="truncate">{hoveredCorridor.mode[locale]}</span>
            <span className="font-mono-data font-semibold text-amber-400 shrink-0">
              {hoveredCorridor.transitDays}d
            </span>
          </div>
          <div className="mt-1 text-xs font-bold text-white">
            {hoveredCorridor.region[locale]}
          </div>
          <div className="mt-1 text-[11px] text-slate-300 truncate">
            {hoveredCorridor.loadingPorts[0]} → {hoveredCorridor.destinations[0]?.[locale]}
          </div>
        </div>
      )}
    </div>
  );
}
