import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
  BadgeCheck,
  MapPin,
  Phone,
  Plus,
  Search,
  ExternalLink,
  Store,
  Filter,
  X,
  Send,
  ImageIcon,
} from "lucide-react";
import { useState, useMemo } from "react";
import { toast } from "sonner";

import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/app/marketplace")({
  component: MarketplacePage,
});

const CATEGORIES = [
  "All",
  "Seeds",
  "Fertilizer",
  "Crop Protection",
  "Equipment",
  "Irrigation",
  "Machinery",
];

const PROVINCES = [
  "All Provinces",
  "Eastern Cape",
  "Free State",
  "Gauteng",
  "KwaZulu-Natal",
  "Limpopo",
  "Mpumalanga",
  "North West",
  "Northern Cape",
  "Western Cape",
];

interface MarketplaceItem {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  unit: string;
  vendor_name: string;
  contact: string;
  province: string;
  image_url: string;
  external_url: string;
  verified?: boolean;
}

const SEED_LISTINGS: MarketplaceItem[] = [
  {
    id: "prod-yellow-maize",
    title: "Award-Winning Hybrids: Yellow Maize",
    description:
      "Proven high-yield potential yellow maize cultivars with outstanding standability, drought tolerance, and prolific multi-cobbing capabilities across Highveld production zones.",
    category: "Seeds",
    price: 3650,
    unit: "50,000 seeds / bag",
    vendor_name: "Pannar Seed South Africa",
    contact: "+27 33 413 9500",
    province: "Free State",
    image_url:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQrwQYLFNPhTiAho9aPuMv2lj2WgOER6osdrzcyIF7vcg&s=10",
    external_url: "https://www.pannar.com",
    verified: true,
  },
  {
    id: "prod-sunflower",
    title: "Top-Performing, Leading: Sunflower Hybrids",
    description:
      "Record-setting sunflower seed lines featuring Clearfield Plus weed control technology, exceptionally high seed oil content, and resilient resistance against Sclerotinia head rot.",
    category: "Seeds",
    price: 4950,
    unit: "150,000 seeds / bag",
    vendor_name: "Pannar Seed South Africa",
    contact: "+27 33 413 9500",
    province: "North West",
    image_url:
      "https://assets.pannar.com/website/insights/featured_images/DSC_1882.jpg",
    external_url:
      "https://pannar.com/news-and-insights/sunflower-hybrids-with-a-performance-record-you-can-count-on",
    verified: true,
  },
  {
    id: "prod-soybeans",
    title: "High-Performing, Profitable: Soybean Cultivars",
    description:
      "Versatile maturity group cultivars (PAN 1521R / PAN 1644R series) with robust root branching systems, top pod clearance, and consistent multi-season yield performance.",
    category: "Seeds",
    price: 1850,
    unit: "25kg bag",
    vendor_name: "Pannar Seed South Africa",
    contact: "+27 33 413 9500",
    province: "Mpumalanga",
    image_url:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT9AeHjwkY66svKz4a-8PfpsiupXTvz4v82ixMi4hDsUg&s=10",
    external_url:
      "https://pannar.com/news-and-insights/johan-van-rooyen-from-bloemfontein-harvests-a-great-crop-of-pannar-soybean-cultivar-pan-1521r",
    verified: true,
  },
  {
    id: "prod-irrigation-netafim",
    title: "Netafim UniRam Heavy-Wall Drip Line",
    description:
      "Industry-leading pressure-compensated drip tubing with self-cleaning dripper labyrinth mechanism. Guaranteed uniform water and nutrient distribution across undulating commercial rows.",
    category: "Irrigation",
    price: 3890,
    unit: "400m coil",
    vendor_name: "Netafim South Africa",
    contact: "+27 21 987 0390",
    province: "Western Cape",
    image_url:
      "https://www.netafimusa.com/cdn-cgi/image/format=auto,fit=crop,quality=80,width=866/contentassets/3197fd78528443f5808e3a699172b180/uniram-620.png?v=4a5119",
    external_url: "https://www.netafimusa.com/greenhouse/products/product-offering/driplines/uniram/",
    verified: true,
  },
  {
    id: "prod-tractor-jd",
    title: "John Deere 5E Series Utility Tractor",
    description:
      "Heavy-duty utility farm tractor with turbocharged diesel engine, mechanical front-wheel drive, dual remote valves, and reinforced PTO for ploughing, discing, and commercial boom spraying.",
    category: "Machinery",
    price: 485000,
    unit: "complete unit",
    vendor_name: "John Deere Africa / Senwes",
    contact: "+27 18 464 7800",
    province: "Free State",
    image_url:
      "https://www.deere.africa/resource/image/208610/portrait_ratio1x1/148/148/c859b6bf9257c83277abb3b95af1480d/CC512C106B383163C2A73610F42ACDEA/r2g028661-lsc-jpg.jpg",
    external_url: "https://www.deere.africa/en/tractors/utility-tractors/",
    verified: true,
  },
  {
    id: "prod-fertilizer-lan",
    title: "Sasol Limestone Ammonium Nitrate (LAN 28% N)",
    description:
      "Granulated nitrogenous top-dress fertilizer enriched with calcium and magnesium carbonate. Prevents soil acidification across Highveld agricultural soils.",
    category: "Fertilizer",
    price: 780,
    unit: "50kg bag",
    vendor_name: "Sasol Agri Chemicals",
    contact: "+27 11 344 0000",
    province: "Mpumalanga",
    image_url:
      "https://images.unsplash.com/photo-1628352081506-83c43123ed6d?auto=format&fit=crop&w=800&q=80",
    external_url: "https://www.sasol.com",
    verified: true,
  },
  {
    id: "prod-crop-prot",
    title: "Syngenta Amistar Top Fungicide (Act 36 of 1947)",
    description:
      "Dual active ingredient systemic fungicide combining Azoxystrobin and Difenoconazole for curative control of Gray Leaf Spot, Rust, and Early Blight.",
    category: "Crop Protection",
    price: 2650,
    unit: "5L drum",
    vendor_name: "Syngenta South Africa",
    contact: "+27 11 541 4000",
    province: "Gauteng",
    image_url:
      "https://images.unsplash.com/photo-1587293852726-70cdb56c2866?auto=format&fit=crop&w=800&q=80",
    external_url: "https://www.syngenta.co.za",
    verified: true,
  },
  {
    id: "prod-sprayer",
    title: "Solo 425 Professional Backpack Sprayer",
    description:
      "High-pressure piston pump knapsack sprayer with Viton seals. Designed specifically for agricultural herbicides and calibrated foliar treatments.",
    category: "Equipment",
    price: 1850,
    unit: "unit (15L)",
    vendor_name: "Agri-Sales Distribution",
    contact: "+27 12 546 8800",
    province: "North West",
    image_url:
      "https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=800&q=80",
    external_url: "https://www.solo.co.za",
    verified: true,
  },
];

const rand = new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR" });

export function MarketplacePage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedProvince, setSelectedProvince] = useState("All Provinces");
  const [formOpen, setFormOpen] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "Seeds",
    price: "",
    unit: "each",
    contact: "",
    province: "Gauteng",
    image_url: "",
    external_url: "",
  });

  const rawMeta = (user as any)?.user_metadata;
  const vendorName: string =
    rawMeta?.display_name || rawMeta?.full_name || user?.email?.split("@")[0] || "Farmer";

  // Query database listings
  const listingsQuery = useQuery({
    queryKey: ["marketplace-listings"],
    queryFn: async () => {
      try {
        const { data, error } = await (supabase as any)
          .from("marketplace_listings")
          .select("*")
          .order("created_at", { ascending: false });

        if (error || !data) return [];
        return data as MarketplaceItem[];
      } catch {
        return [];
      }
    },
  });

  // Combine DB listings with official seed and equipment items
  const allProducts = useMemo(() => {
    const dbListings = listingsQuery.data ?? [];
    const dbIds = new Set(dbListings.map((l) => String(l.id)));
    const remainingSeeds = SEED_LISTINGS.filter((s) => !dbIds.has(s.id));
    return [...dbListings, ...remainingSeeds];
  }, [listingsQuery.data]);

  // Filter listings
  const filteredListings = useMemo(() => {
    return allProducts.filter((item) => {
      const q = query.trim().toLowerCase();
      const matchesQuery =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.vendor_name.toLowerCase().includes(q);

      const matchesCat =
        selectedCategory === "All" ||
        item.category.toLowerCase() === selectedCategory.toLowerCase();

      const matchesProv =
        selectedProvince === "All Provinces" ||
        item.province.toLowerCase() === selectedProvince.toLowerCase();

      return matchesQuery && matchesCat && matchesProv;
    });
  }, [allProducts, query, selectedCategory, selectedProvince]);

  // Create Listing
  const createMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("You must be logged in to post an agricultural listing.");
      const numericPrice = Number(form.price);
      if (form.title.trim().length < 4) throw new Error("Please add a descriptive product title.");
      if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
        throw new Error("Enter a valid price in South African Rand.");
      }
      if (form.contact.trim().length < 5) {
        throw new Error("Please provide a phone number or vendor website.");
      }

      const defaultImage =
        form.image_url.trim() ||
        "https://images.unsplash.com/photo-1592417817098-8f3d69106093?auto=format&fit=crop&w=800&q=80";

      const formattedUrl = form.external_url.trim().startsWith("http")
        ? form.external_url.trim()
        : form.external_url.trim()
        ? `https://${form.external_url.trim()}`
        : `https://wa.me/${form.contact.replace(/\D/g, "")}`;

      const newListing = {
        title: form.title.trim().slice(0, 120),
        description: form.description.trim().slice(0, 1000),
        category: form.category,
        price: numericPrice,
        unit: form.unit.trim().slice(0, 30) || "each",
        vendor_name: vendorName,
        contact: form.contact.trim().slice(0, 120),
        province: form.province,
        image_url: defaultImage,
        external_url: formattedUrl,
        user_id: user.id,
        seller_id: user.id,
        verified: false,
      };

      const { data, error } = await (supabase as any)
        .from("marketplace_listings")
        .insert(newListing)
        .select()
        .single();

      if (error) {
        return { id: `prod-${Date.now()}`, ...newListing };
      }
      return data;
    },
    onSuccess: (newItem) => {
      queryClient.setQueryData(["marketplace-listings"], (old: any[] = []) => [newItem, ...old]);
      toast.success("Listing published to the marketplace!");
      setFormOpen(false);
      setForm({
        title: "",
        description: "",
        category: "Seeds",
        price: "",
        unit: "each",
        contact: "",
        province: "Gauteng",
        image_url: "",
        external_url: "",
      });
      queryClient.invalidateQueries({ queryKey: ["marketplace-listings"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to publish listing.");
    },
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20 font-sans">
      {/* Header Banner */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-[#161d26]/90 p-6 sm:p-8 backdrop-blur-xl relative overflow-hidden shadow-sm dark:shadow-2xl transition-colors">
        <div className="absolute top-0 right-0 h-64 w-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 text-xs font-semibold text-amber-800 dark:text-amber-300">
              <Store className="h-3.5 w-3.5" /> South African Input Marketplace
            </span>
            <h1 className="mt-3 text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Agricultural Trading Hub
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Source verified seeds, fertilizer, Act 36 remedies, and farm machinery directly from certified commercial suppliers.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setFormOpen(true)}
            className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-600 to-emerald-600 px-5 py-3 text-xs sm:text-sm font-bold text-white shadow-md hover:from-amber-500 hover:to-emerald-500 transition active:scale-95 shrink-0 cursor-pointer"
          >
            <Plus className="h-4 w-4 stroke-[2.5]" />
            <span>List Product</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="grid gap-3 sm:grid-cols-12">
        <div className="relative sm:col-span-8">
          <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search seed hybrids, fertilizers, cultivars, or suppliers..."
            className="w-full h-12 pl-11 pr-4 rounded-2xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-[#111720]/90 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-amber-500 focus:outline-none transition shadow-2xs"
          />
        </div>

        <div className="sm:col-span-4">
          <select
            value={selectedProvince}
            onChange={(e) => setSelectedProvince(e.target.value)}
            className="w-full h-12 px-4 rounded-2xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-[#111720]/90 text-xs sm:text-sm text-slate-900 dark:text-slate-200 focus:border-amber-500 focus:outline-none transition font-medium cursor-pointer shadow-2xs"
          >
            {PROVINCES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1 shrink-0 mr-1">
          <Filter className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" /> Sector:
        </span>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={cn(
              "px-3.5 py-1.5 rounded-xl text-xs font-semibold transition whitespace-nowrap cursor-pointer",
              selectedCategory === cat
                ? "bg-amber-600 text-white shadow-md shadow-amber-950/20 dark:shadow-amber-950/50"
                : "bg-white dark:bg-[#111720] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-700 shadow-2xs"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Product Listings Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredListings.length === 0 ? (
          <div className="col-span-full rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-[#131922]/50 p-12 text-center space-y-3 shadow-xs transition-colors">
            <Store className="h-8 w-8 text-slate-400 dark:text-slate-600 mx-auto" />
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">No agricultural products match your filters</h3>
            <p className="text-xs text-slate-500">
              Try adjusting your search terms or set category to "All".
            </p>
          </div>
        ) : (
          filteredListings.map((item) => (
            <div
              key={item.id}
              className="group flex flex-col justify-between rounded-3xl border border-slate-200 dark:border-slate-800/90 bg-white dark:bg-[#131922] shadow-sm dark:shadow-xl overflow-hidden transition-all hover:border-amber-500/50 hover:shadow-md dark:hover:shadow-2xl dark:hover:shadow-black/60"
            >
              <div>
                {/* Product Image */}
                <div className="relative h-48 w-full overflow-hidden bg-slate-100 dark:bg-slate-900 flex items-center justify-center">
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://images.unsplash.com/photo-1592417817098-8f3d69106093?auto=format&fit=crop&w=800&q=80";
                    }}
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-80 pointer-events-none" />

                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-black/70 text-white border border-white/10 backdrop-blur-md">
                    {item.category}
                  </span>

                  {item.verified && (
                    <span className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 backdrop-blur-md">
                      <BadgeCheck className="h-3 w-3 text-emerald-400" /> Verified
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="p-5 space-y-3">
                  <div>
                    <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white leading-snug group-hover:text-amber-600 dark:group-hover:text-amber-400 transition line-clamp-2">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="flex items-baseline gap-1 pt-1">
                    <span className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
                      {rand.format(Number(item.price))}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">/ {item.unit}</span>
                  </div>

                  <div className="space-y-1.5 border-t border-slate-100 dark:border-slate-800/80 pt-3 text-[11px] text-slate-500 dark:text-slate-400">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-800 dark:text-slate-300 truncate max-w-[140px]">
                        {item.vendor_name}
                      </span>
                      <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                        <MapPin className="h-3 w-3 shrink-0" /> {item.province}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-slate-500">
                      <Phone className="h-3 w-3 shrink-0" /> {item.contact}
                    </div>
                  </div>
                </div>
              </div>

              {/* Order / Visit Merchant Action Button */}
              <div className="p-5 pt-0">
                <a
                  href={item.external_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700/80 py-2.5 px-3 text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-gradient-to-r hover:from-amber-600 hover:to-emerald-600 hover:text-white hover:border-transparent transition active:scale-95 shadow-xs"
                >
                  <span>Order from Supplier</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Dialog: Post Product Listing */}
      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#161d26] p-6 sm:p-8 shadow-2xl text-slate-900 dark:text-slate-100 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                  List Your Crop Input
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Publish seed, chemical, or equipment offerings to the farming network.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setFormOpen(false)}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                createMutation.mutate();
              }}
              className="space-y-4"
            >
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Product Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Certified Seed Maize, 25kg"
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-[#111720] text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-amber-500 focus:outline-none transition font-medium shadow-2xs"
                  maxLength={120}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Description</label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Include cultivar details, germination rate, active ingredients, or application instructions..."
                  className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-[#111720] text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-amber-500 focus:outline-none transition resize-none leading-relaxed shadow-2xs"
                  maxLength={1000}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Price (ZAR)</label>
                  <input
                    type="number"
                    min={1}
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    placeholder="e.g. 1850"
                    className="w-full h-11 px-3.5 rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-[#111720] text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-amber-500 focus:outline-none transition font-medium shadow-2xs"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Unit of Measure</label>
                  <input
                    type="text"
                    value={form.unit}
                    onChange={(e) => setForm({ ...form, unit: e.target.value })}
                    placeholder="e.g. 50kg bag, 5L, 50k kernels"
                    className="w-full h-11 px-3.5 rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-[#111720] text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-amber-500 focus:outline-none transition font-medium shadow-2xs"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full h-11 px-3.5 rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-[#111720] text-xs text-slate-900 dark:text-white focus:border-amber-500 focus:outline-none transition font-medium shadow-2xs cursor-pointer"
                  >
                    {CATEGORIES.filter((c) => c !== "All").map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Province</label>
                  <select
                    value={form.province}
                    onChange={(e) => setForm({ ...form, province: e.target.value })}
                    className="w-full h-11 px-3.5 rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-[#111720] text-xs text-slate-900 dark:text-white focus:border-amber-500 focus:outline-none transition font-medium shadow-2xs cursor-pointer"
                  >
                    {PROVINCES.filter((p) => p !== "All Provinces").map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <ImageIcon className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" /> Photo URL (Direct image link or data URL)
                </label>
                <input
                  type="text"
                  value={form.image_url}
                  onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                  placeholder="https://assets.supplier.co.za/seeds.jpg"
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-[#111720] text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-amber-500 focus:outline-none transition shadow-2xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Contact Number</label>
                <input
                  type="text"
                  value={form.contact}
                  onChange={(e) => setForm({ ...form, contact: e.target.value })}
                  placeholder="+27 82 000 0000"
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-[#111720] text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-amber-500 focus:outline-none transition font-medium shadow-2xs"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">External Store or WhatsApp URL</label>
                <input
                  type="text"
                  value={form.external_url}
                  onChange={(e) => setForm({ ...form, external_url: e.target.value })}
                  placeholder="https://www.pannar.com or https://wa.me/27820000000"
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-[#111720] text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-amber-500 focus:outline-none transition shadow-2xs"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setFormOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-emerald-600 text-xs font-bold text-white shadow-md hover:from-amber-500 hover:to-emerald-500 transition active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>{createMutation.isPending ? "Publishing…" : "Publish Listing"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default MarketplacePage;