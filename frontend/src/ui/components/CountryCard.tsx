import { useEffect, useMemo, useRef, useState } from "react";
import { geoMercator, geoPath } from "d3-geo";
import world from "world-countries";

function zhToEn(nameZh: string): string | undefined {
  const map: Record<string, string> = {
    "中国": "China",
    "法国": "France",
    "巴西": "Brazil",
    "日本": "Japan",
    "韩国": "South Korea",
    "蒙古": "Mongolia",
    "西班牙": "Spain",
    "意大利": "Italy",
    "德国": "Germany",
    "阿根廷": "Argentina",
    "智利": "Chile",
    "秘鲁": "Peru",
    "美国": "United States",
    "加拿大": "Canada",
    "俄罗斯": "Russia",
    "印度": "India",
    "澳大利亚": "Australia",
    "英国": "United Kingdom",
  };
  return map[nameZh];
}

export function CountryCard(props: {
  countryName: string;
  revealed: boolean;
  width?: number;
  height?: number;
}) {
  const { countryName, revealed, width = 900, height = 520 } = props;
  const nameEn = useMemo(() => zhToEn(countryName) ?? countryName, [countryName]);
  const feature = useMemo(() => {
    return world.find((f) => f.name.common === nameEn);
  }, [nameEn]);

  const [paths, setPaths] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(false);
  const cacheRef = useRef<Record<string, any>>({});

  function getFallbackGeoJsonUrl(name: string | undefined, cca3?: string): string | null {
    if (cca3 && cca3.length === 3) {
      return `https://raw.githubusercontent.com/johan/world.geo.json/master/countries/${cca3}.geo.json`;
    }
    if (!name) return null;
    switch (name) {
      case "China":
        return "https://geo.datav.aliyun.com/areas_v3/bound/100000.json";
      case "France":
        return "https://raw.githubusercontent.com/johan/world.geo.json/master/countries/FRA.geo.json";
      case "Brazil":
        return "https://raw.githubusercontent.com/johan/world.geo.json/master/countries/BRA.geo.json";
      default:
        return null;
    }
  }

  useEffect(() => {
    async function computeFromGeoJson(geojson: any) {
      const projection = geoMercator().fitSize([width - 40, height - 40], geojson as any);
      const path = geoPath(projection as any);
      if (geojson.type === "FeatureCollection") {
        const ds: string[] = [];
        for (const f of geojson.features || []) {
          const g = f.geometry;
          if (!g || (g.type !== "Polygon" && g.type !== "MultiPolygon")) continue;
          const d = path(f as any);
          if (d) ds.push(d);
        }
        setPaths(ds.length ? ds : null);
      } else if (geojson.type === "Feature") {
        const g = geojson.geometry;
        if (g && (g.type === "Polygon" || g.type === "MultiPolygon")) {
          const d = path(geojson as any);
          setPaths(d ? [d] : null);
        } else {
          setPaths(null);
        }
      } else {
        const d = path(geojson as any);
        setPaths(d ? [d] : null);
      }
    }

    async function run() {
      if (feature && (feature as any).geometry) {
        await computeFromGeoJson(feature);
        return;
      }

      if (nameEn === "China") {
        try {
          setLoading(true);
          const urls = [
            "https://raw.githubusercontent.com/johan/world.geo.json/master/countries/CHN.geo.json",
            "https://raw.githubusercontent.com/johan/world.geo.json/master/countries/TWN.geo.json",
          ];
          const fetched: any[] = [];
          for (const u of urls) {
            if (cacheRef.current[u]) {
              fetched.push(cacheRef.current[u]);
              continue;
            }
            const res = await fetch(u, { cache: "force-cache" });
            if (res.ok) {
              const data = await res.json();
              const geo = (data.type === "FeatureCollection")
                ? { type: "FeatureCollection", features: data.features }
                : data;
              cacheRef.current[u] = geo;
              fetched.push(geo);
            }
          }
          if (fetched.length) {
            const features: any[] = [];
            for (const g of fetched) {
              if (g.type === "FeatureCollection") {
                features.push(...(g.features || []));
              } else {
                features.push(g);
              }
            }
            const merged = { type: "FeatureCollection", features };
            await computeFromGeoJson(merged);
            return;
          }
        } catch {
          // ignore and fallback
        } finally {
          setLoading(false);
        }
      }

      const url = getFallbackGeoJsonUrl(nameEn, (feature as any)?.cca3);
      if (!url) {
        setPaths(null);
        return;
      }
      try {
        setLoading(true);
        if (cacheRef.current[url]) {
          await computeFromGeoJson(cacheRef.current[url]);
          return;
        }
        const res = await fetch(url, { cache: "force-cache" });
        if (!res.ok) throw new Error(`Failed to fetch geojson: ${res.status}`);
        const data = await res.json();
        const geo = (data.type === "FeatureCollection")
          ? { type: "FeatureCollection", features: data.features }
          : data;
        cacheRef.current[url] = geo;
        await computeFromGeoJson(geo);
      } catch {
        setPaths(null);
      } finally {
        setLoading(false);
      }
    }
    run();
  }, [feature, nameEn, width, height]);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
      <defs>
        <linearGradient id="nebulaGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ec4899" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
        <filter id="nebulaSoft" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="0" stdDeviation="8" floodColor="#ec4899" floodOpacity="0.35" />
        </filter>
      </defs>
      {paths && paths.length ? (
        <g>
          {paths.map((d, i) => (
            <path
              key={i}
              d={d}
              fill="url(#nebulaGrad)"
              filter="url(#nebulaSoft)"
              className={`transition-all duration-700 ${revealed ? "opacity-100 scale-100" : "opacity-95 scale-[0.98]"}`}
            />
          ))}
        </g>
      ) : (
        <text x={width / 2} y={height / 2} textAnchor="middle" fill="#94a3b8">
          {loading ? "地图加载中..." : "地图数据未找到"}
        </text>
      )}
    </svg>
  );
}
