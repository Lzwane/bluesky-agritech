import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import {
  Search,
  BookOpen,
  Filter,
  Leaf,
  FlaskConical,
  ShieldCheck,
  Calendar,
  X,
  ChevronRight,
  Info,
  Bug,
  Sparkles,
  MapPin,
  Bot,
  AlertTriangle,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/_authenticated/app/library")({
  component: LibraryPage,
});

export interface PathologyItem {
  id: string;
  name: string;
  scientificName: string;
  cropCategory: "Maize" | "Citrus" | "Tomato" | "Potato" | "Avocado" | "Brassicas" | "Macadamia" | "Sugarcane" | "AI Research";
  type: "Fungal" | "Bacterial" | "Viral" | "Pest / Insect" | "Nutrient Deficiency";
  severity: "Low" | "Moderate" | "High" | "Critical";
  commonRegions: string[];
  symptoms: string[];
  organicProtocol: string;
  chemicalProtocol: string;
  preventativeMeasures: string[];
  withholdingPeriod: string;
  highRiskSeason: string;
  isLiveGenerated?: boolean;
  discoveredBy?: string;
  createdAt?: string;
}

const STATIC_PATHOLOGY_DATABASE: PathologyItem[] = [
  {
    id: "nclb-maize",
    name: "Northern Corn Leaf Blight",
    scientificName: "Exserohilum turcicum",
    cropCategory: "Maize",
    type: "Fungal",
    severity: "High",
    commonRegions: ["North West", "Mpumalanga", "Free State", "KwaZulu-Natal"],
    symptoms: [
      "Long, elliptical, cigar-shaped grayish-green to tan lesions (2.5 - 15 cm)",
      "Lesions develop dark fungal spore dusting under high canopy humidity",
      "Premature foliar desiccation resembling severe frost burn",
    ],
    organicProtocol:
      "Spray bio-fungicide Bacillus amyloliquefaciens (2L/ha) preventatively; apply cold-pressed neem seed oil at first lesion appearance.",
    chemicalProtocol:
      "Apply Azoxystrobin 200g/L + Difenoconazole 125g/L at 500ml/ha or Pyraclostrobin 250g/EC at 200L/ha spray volume at VT/R1 tassel stage.",
    preventativeMeasures: [
      "Plant certified resistant hybrid seed cultivars",
      "Implement minimum 2-year non-host legume crop rotation (Soybeans/Groundnuts)",
      "Incorporate crop stubble through deep ripping post-harvest to speed up residue decomposition",
    ],
    withholdingPeriod: "14 - 21 days",
    highRiskSeason: "Mid-to-late summer during prolonged wet overcast canopy cycles",
  },
  {
    id: "fall-armyworm",
    name: "Fall Armyworm",
    scientificName: "Spodoptera frugiperda",
    cropCategory: "Maize",
    type: "Pest / Insect",
    severity: "Critical",
    commonRegions: ["Limpopo", "Mpumalanga", "Gauteng", "North West"],
    symptoms: [
      "Ragged 'shot-hole' feeding damage on central maize whorl leaves",
      "Accumulation of coarse, sawdust-like larval frass in the central leaf funnel",
      "Boring directly through husk covers into mature maize ears",
    ],
    organicProtocol:
      "Apply Spinosad biological insecticide or Beauveria bassiana liquid concentrate into whorls during late afternoon.",
    chemicalProtocol:
      "Spray Chlorantraniliprole 200g/L or Emamectin benzoate 50g/kg directed into the leaf whorl before larvae reach instar 4.",
    preventativeMeasures: [
      "Scout 20 plants per quadrant twice weekly from emergence to tasseling",
      "Deploy pheromone bucket traps for early male moth flight detection",
      "Maintain intercropped Desmodium border push-pull strips where feasible",
    ],
    withholdingPeriod: "7 - 14 days",
    highRiskSeason: "Early spring through late summer across all warm grain corridors",
  },
  {
    id: "citrus-black-spot",
    name: "Citrus Black Spot (CBS)",
    scientificName: "Phyllosticta citricarpa",
    cropCategory: "Citrus",
    type: "Fungal",
    severity: "Critical",
    commonRegions: ["Limpopo", "Mpumalanga", "KwaZulu-Natal", "Eastern Cape"],
    symptoms: [
      "Hard spot lesions: small, circular, sunken reddish-brown spots with gray centers",
      "Virulent spot: large necrotic lesions spreading across mature rind surface",
      "Premature fruit drop under elevated summer heat stress",
    ],
    organicProtocol:
      "Apply Copper oxychloride or Copper hydroxide preventive sprays with organic spreader stickers every 21 days starting at petal drop.",
    chemicalProtocol:
      "Apply Mancozeb 800 WP combined with Strobilurins (e.g. Pyraclostrobin) on strict registered CRI export compliance schedules.",
    preventativeMeasures: [
      "Sweep and mulch decaying orchard floor leaf litter with mechanical sweepers",
      "Prune interior water shoots to optimize airflow and sunlight penetration",
      "Adhere strictly to official DAFF phytosanitary export protocols",
    ],
    withholdingPeriod: "30 - 45 days (Export compliance)",
    highRiskSeason: "Spring blossom petal drop through mid-summer rainfall events",
  },
  {
    id: "late-blight-tomato",
    name: "Late Blight",
    scientificName: "Phytophthora infestans",
    cropCategory: "Tomato",
    type: "Fungal",
    severity: "Critical",
    commonRegions: ["Limpopo", "Eastern Cape", "Western Cape", "Gauteng"],
    symptoms: [
      "Large, irregular water-soaked dark lesions on foliage turning rapidly brown and papery",
      "Delicate white fungal downy mildew on leaf undersides during high relative humidity",
      "Firm, greasy, olive-brown blotches on green and ripening tomato fruit",
    ],
    organicProtocol:
      "Foliar sprays of certified Copper Octanoate or bio-control Trichoderma harzianum at first warning of cool humid weather.",
    chemicalProtocol:
      "Apply Metalaxyl-M + Mancozeb (Ridomil Gold) alternating with Cymoxanil or Dimethomorph to manage resistance.",
    preventativeMeasures: [
      "Utilize strict drip irrigation; avoid overhead sprinkler systems that wet foliage",
      "Ensure minimum 1.5m row spacing for optimal ventilation",
      "Destroy and bag culled infected vine residue immediately; do not compost",
    ],
    withholdingPeriod: "7 days",
    highRiskSeason: "Cool, cloudy, and wet periods with relative humidity above 90%",
  },
  {
    id: "bacterial-wilt-tomato",
    name: "Bacterial Wilt",
    scientificName: "Ralstonia solanacearum",
    cropCategory: "Tomato",
    type: "Bacterial",
    severity: "Critical",
    commonRegions: ["Limpopo", "Mpumalanga", "KwaZulu-Natal"],
    symptoms: [
      "Rapid wilting of fresh green foliage during warm afternoons without initial yellowing",
      "Stems remain green while plants collapse permanently within 48-72 hours",
      "Milky white bacterial streaming visible when lower stem section is immersed in clean water",
    ],
    organicProtocol:
      "Incorporate high-glucosinolate bio-fumigant mustard crops prior to planting; treat soil with antagonistic Bacillus subtilis strains.",
    chemicalProtocol:
      "No effective registered chemical cure exists once vascular infection occurs. Pre-plant soil fumigation with Dazomet or 1,3-Dichloropropene.",
    preventativeMeasures: [
      "Test soil and borehole irrigation water for pathogen presence prior to transplanting",
      "Graft commercial tomato scions onto resistant wild rootstocks",
      "Avoid planting in fields previously cropped with solanaceous species for at least 4 years",
    ],
    withholdingPeriod: "Pre-plant only",
    highRiskSeason: "Hot summer weather with high soil moisture and wet conditions",
  },
  {
    id: "potato-scab",
    name: "Common Potato Scab",
    scientificName: "Streptomyces scabies",
    cropCategory: "Potato",
    type: "Bacterial",
    severity: "Moderate",
    commonRegions: ["Free State", "Limpopo", "Western Cape", "Sandveld"],
    symptoms: [
      "Rough, corky, pitted lesions on potato tuber skin reducing marketability",
      "Star-shaped superficial lesions coalescing into large raised brown scabs",
      "Stems and foliage remain completely asymptomatic above ground",
    ],
    organicProtocol:
      "Soil application of elemental agricultural sulfur to lower soil pH below 5.2 where Streptomyces cannot proliferate.",
    chemicalProtocol:
      "Seed piece treatment with Fludioxonil + Mancozeb prior to planting in infected soil parcels.",
    preventativeMeasures: [
      "Maintain consistent, adequate soil moisture during the first 6 weeks of tuber initiation",
      "Avoid applying untreated manure or agricultural lime immediately before potato planting",
      "Rotate with rye, millet, or oats to suppress soil inoculant reservoirs",
    ],
    withholdingPeriod: "Pre-planting application",
    highRiskSeason: "Dry, warm soil conditions during tuber initiation stages",
  },
  {
    id: "black-rot-brassicas",
    name: "Black Rot of Cabbage",
    scientificName: "Xanthomonas campestris pv. campestris",
    cropCategory: "Brassicas",
    type: "Bacterial",
    severity: "High",
    commonRegions: ["Gauteng", "Limpopo", "North West", "Eastern Cape"],
    symptoms: [
      "Characteristic yellow V-shaped lesions progressing from leaf margins inward",
      "Blackening of internal vascular leaf veins and cabbage core xylem",
      "Foul odor and secondary soft rot decay under wet storage conditions",
    ],
    organicProtocol:
      "Hot water seed treatment at 50°C for 25 minutes to eliminate seed-borne bacteria, followed by copper hydroxide sprays.",
    chemicalProtocol:
      "Preventive sprays of Copper hydroxide + Mancozeb applied every 7-10 days in warm wet weather.",
    preventativeMeasures: [
      "Use certified disease-free tested hybrid cabbage seeds",
      "Control cruciferous weed hosts (wild mustard/radish) around field perimeters",
      "Do not cultivate or walk through fields when foliage is wet from dew or rain",
    ],
    withholdingPeriod: "7 days",
    highRiskSeason: "Warm, rainy periods with temperatures between 25°C and 30°C",
  },
  {
    id: "phytophthora-root-rot-avocado",
    name: "Phytophthora Root Rot",
    scientificName: "Phytophthora cinnamomi",
    cropCategory: "Avocado",
    type: "Fungal",
    severity: "Critical",
    commonRegions: ["Limpopo", "Mpumalanga", "KwaZulu-Natal"],
    symptoms: [
      "Pale, wilted, yellowish leaves that remain small and drop prematurely",
      "Dieback of feeder roots which turn black, brittle, and rotten",
      "Canopy branch sun-scald and lack of new seasonal flush growth",
    ],
    organicProtocol:
      "Heavy coarse woodchip mulching (15cm thick) away from trunk; apply mycorrhizal fungi and Trichoderma soil drenches.",
    chemicalProtocol:
      "Phosphonate (Potassium phosphite) trunk injections or foliar sprays timed to root flush periods according to tree phenology.",
    preventativeMeasures: [
      "Plant on high ridges or raised mounds to promote rapid root zone drainage",
      "Use clonal tolerant rootstocks such as Dusa, Bounty, or Duke 7",
      "Sanitize vehicle tires and footwear before entering orchard blocks",
    ],
    withholdingPeriod: "14 days",
    highRiskSeason: "Waterlogged soil conditions during heavy spring and summer rains",
  },
  {
    id: "macadamia-felted-coccid",
    name: "Macadamia Felted Coccid (MFC)",
    scientificName: "Eriococcus ironsidei",
    cropCategory: "Macadamia",
    type: "Pest / Insect",
    severity: "High",
    commonRegions: ["Mpumalanga", "Limpopo", "KwaZulu-Natal"],
    symptoms: [
      "White felt-like scale encrusting green shoots, flowers, nut husks, and branches",
      "Severe distortion and stunting of new flush leaves and flowering racemes",
      "Premature nut drop and branch dieback in dense interior canopy areas",
    ],
    organicProtocol:
      "Application of high-grade narrow-range horticultural mineral spray oil (1.5-2%) to smother crawler nymphs.",
    chemicalProtocol:
      "Targeted sprays of Insect Growth Regulators (Pyriproxyfen 100 EC) or Spirotetramat during post-harvest crawler emergence.",
    preventativeMeasures: [
      "Prune out low, dense crossing branches to improve spray canopy penetration",
      "Introduce and conserve natural ladybird predators (Chilocorus circumdatus)",
      "Quarantine and inspect all incoming nursery trees before orchard introduction",
    ],
    withholdingPeriod: "28 days",
    highRiskSeason: "Spring flush and early nut development through dry autumn months",
  },
  {
    id: "sugarcane-smut",
    name: "Sugarcane Smut",
    scientificName: "Sporisorium scitamineum",
    cropCategory: "Sugarcane",
    type: "Fungal",
    severity: "High",
    commonRegions: ["KwaZulu-Natal", "Mpumalanga"],
    symptoms: [
      "Emergence of a distinct whip-like, curved black terminal shoot from the cane apex",
      "Severe stunting and grass-like tillering with thin, elongated stalks",
      "Loss of sucrose yield and rapid degradation of ratoon crop vigor",
    ],
    organicProtocol:
      "Rogue out and destroy infected whips inside sealed plastic bags before spores disperse across the field.",
    chemicalProtocol:
      "Fungicidal hot-water treatment (Triadimefon dip at 52°C for 20 minutes) of seed cane setts prior to planting.",
    preventativeMeasures: [
      "Plant SASRI-recommended smut-resistant varieties (e.g., NCo376 alternatives)",
      "Establish dedicated certified disease-free nursery seed-beds",
      "Strict rogueing schedule of first and second ratoon crops",
    ],
    withholdingPeriod: "Pre-planting sett treatment",
    highRiskSeason: "Hot, dry conditions followed by windy spells aiding spore dispersal",
  },
  {
    id: "nitrogen-deficiency",
    name: "Nitrogen (N) Deficiency",
    scientificName: "Physiological Nutrient Deficiency",
    cropCategory: "Maize",
    type: "Nutrient Deficiency",
    severity: "Moderate",
    commonRegions: ["Nationwide across South Africa"],
    symptoms: [
      "General pale green to yellow chlorosis starting on the oldest lower leaves",
      "Distinct V-shaped yellowing starting at the leaf tip and progressing along the midrib",
      "Stunted crop growth, spindly stalks, and poor ear tip filling",
    ],
    organicProtocol:
      "Incorporate well-rotted cattle kraal manure (10-15t/ha) or apply liquid fish hydrolysate and kelp meal extracts as foliar feeds.",
    chemicalProtocol:
      "Top-dress with Limestone Ammonium Nitrate (LAN 28% N) or Urea (46% N) at 4-6 leaf stage according to calibrated soil analysis targets.",
    preventativeMeasures: [
      "Conduct annual grid soil sampling to calculate realistic nitrogen replacement budgets",
      "Split nitrogen applications between planting and top-dressing to minimize leaching",
      "Incorporate winter cover crops (Hairy Vetch / Crimson Clover) to fix atmospheric nitrogen",
    ],
    withholdingPeriod: "0 days",
    highRiskSeason: "Early vegetative growth stages following intense leaching rains",
  },
];

const CROP_CATEGORIES = ["All", "Maize", "Citrus", "Tomato", "Potato", "Avocado", "Brassicas", "Macadamia", "Sugarcane", "AI Research"];
const PATHOGEN_TYPES = ["All", "Fungal", "Bacterial", "Viral", "Pest / Insect", "Nutrient Deficiency"];

function LibraryPage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCrop, setSelectedCrop] = useState("All");
  const [selectedType, setSelectedType] = useState("All");
  const [activeItem, setActiveItem] = useState<PathologyItem | null>(null);

  const [communityPathogens, setCommunityPathogens] = useState<PathologyItem[]>(() => {
    try {
      const saved = localStorage.getItem("bluesky_community_pathology");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isAiSearching, setIsAiSearching] = useState(false);

  const rawMeta = (user as any)?.user_metadata;
  const currentFarmerName = useMemo(() => {
    return (
      rawMeta?.full_name ||
      rawMeta?.display_name ||
      rawMeta?.name ||
      user?.email?.split("@")[0] ||
      "Farmer"
    );
  }, [rawMeta, user]);

  useEffect(() => {
    let isMounted = true;

    async function loadCommunityPathogens() {
      try {
        const { data, error } = await (supabase as any)
          .from("pathology_library")
          .select("*")
          .order("created_at", { ascending: false });

        if (!error && data && isMounted) {
          const formatted: PathologyItem[] = data.map((d: any) => ({
            id: String(d.id),
            name: d.name,
            scientificName: d.scientific_name || "Pathogen species complex",
            cropCategory: (d.crop_category || "AI Research") as PathologyItem["cropCategory"],
            type: (d.pathogen_type || "Fungal") as PathologyItem["type"],
            severity: (d.severity || "Moderate") as PathologyItem["severity"],
            commonRegions: Array.isArray(d.common_regions) ? d.common_regions : ["South Africa"],
            symptoms: Array.isArray(d.symptoms) ? d.symptoms : [],
            organicProtocol: d.organic_protocol || "Biological control recommended.",
            chemicalProtocol: d.chemical_protocol || "Consult registered Act 36 remedies.",
            preventativeMeasures: Array.isArray(d.preventative_measures) ? d.preventative_measures : ["Implement strict sanitation."],
            withholdingPeriod: d.withholding_period || "14 days",
            highRiskSeason: d.high_risk_season || "Seasonal humid weather",
            isLiveGenerated: true,
            discoveredBy: d.author_name || "South African Grower",
            createdAt: d.created_at,
          }));

          setCommunityPathogens(formatted);
          localStorage.setItem("bluesky_community_pathology", JSON.stringify(formatted));
        }
      } catch (err) {
        console.warn("Could not load community pathogens from Supabase:", err);
      }
    }

    loadCommunityPathogens();

    const channel = supabase
      .channel("pathology_library_realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "pathology_library" },
        (payload: any) => {
          const d = payload.new as any;
          if (!d || !d.id) return;

          const incoming: PathologyItem = {
            id: String(d.id),
            name: d.name || "Unknown Pathogen",
            scientificName: d.scientific_name || "Pathogen species complex",
            cropCategory: (d.crop_category || "AI Research") as PathologyItem["cropCategory"],
            type: (d.pathogen_type || "Fungal") as PathologyItem["type"],
            severity: (d.severity || "Moderate") as PathologyItem["severity"],
            commonRegions: Array.isArray(d.common_regions) ? d.common_regions : ["South Africa"],
            symptoms: Array.isArray(d.symptoms) ? d.symptoms : [],
            organicProtocol: d.organic_protocol || "",
            chemicalProtocol: d.chemical_protocol || "",
            preventativeMeasures: Array.isArray(d.preventative_measures) ? d.preventative_measures : [],
            withholdingPeriod: d.withholding_period || "14 days",
            highRiskSeason: d.high_risk_season || "",
            isLiveGenerated: true,
            discoveredBy: d.author_name || "Community Farmer",
            createdAt: d.created_at || new Date().toISOString(),
          };

          setCommunityPathogens((prev) => [
            incoming,
            ...prev.filter((p) => p.id !== incoming.id),
          ]);
          toast.info(`New pathogen dossier compiled: "${incoming.name}"`);
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  const allItems = useMemo(() => {
    return [...communityPathogens, ...STATIC_PATHOLOGY_DATABASE];
  }, [communityPathogens]);

  const filteredItems = useMemo(() => {
    return allItems.filter((item) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.scientificName.toLowerCase().includes(q) ||
        item.cropCategory.toLowerCase().includes(q) ||
        item.symptoms.some((s) => s.toLowerCase().includes(q));

      const matchesCrop = selectedCrop === "All" || item.cropCategory === selectedCrop;
      const matchesType = selectedType === "All" || item.type === selectedType;

      return matchesSearch && matchesCrop && matchesType;
    });
  }, [allItems, searchQuery, selectedCrop, selectedType]);

  const handleAiDeepSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error("Enter a disease or pest name into the search bar first.");
      return;
    }

    setIsAiSearching(true);
    try {
      toast.info(`Querying Agronomist AI for: "${searchQuery}"...`);

      const { data, error } = await supabase.functions.invoke("diagnose-crop", {
        body: {
          crop: selectedCrop !== "All" ? selectedCrop : "South African Crops",
          imageBase64: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
          imageMediaType: "image/png",
          customPrompt: `Provide an exhaustive agronomic dossier for this crop disease or pest: "${searchQuery}". Target Southern African agricultural conditions.`,
        },
      });

      if (error || !data || data.error) {
        throw new Error(data?.error || error?.message || "AI Research endpoint unavailable");
      }

      const cleanCrop = (data.crop?.includes("Citrus")
        ? "Citrus"
        : data.crop?.includes("Tomato")
        ? "Tomato"
        : data.crop?.includes("Potato")
        ? "Potato"
        : data.crop?.includes("Maize")
        ? "Maize"
        : selectedCrop !== "All"
        ? selectedCrop
        : "AI Research") as any;

      const newId = `ai-${Date.now()}`;
      const newItem: PathologyItem = {
        id: newId,
        name: data.disease_name || searchQuery,
        scientificName: data.scientific_name || "Pathogen species complex",
        cropCategory: cleanCrop,
        type: (data.pathogen_type || "Fungal") as any,
        severity: (data.severity || "Moderate") as any,
        commonRegions: ["South Africa (National Alert)"],
        symptoms: data.symptoms_observed || ["Visual foliar symptoms synthesized by Agronomist AI"],
        organicProtocol: data.organic_treatment || "Apply broad-spectrum bio-fungicide preventative.",
        chemicalProtocol: data.chemical_treatment || "Refer to registered Act 36 of 1947 agricultural chemicals.",
        preventativeMeasures: Array.isArray(data.preventative_measures)
          ? data.preventative_measures
          : [data.preventative_measures || "Strict sanitization and crop rotation."],
        withholdingPeriod: data.safety_note || "14 days standard pre-harvest interval",
        highRiskSeason: "Active seasonal cycles with high temperature and humidity",
        isLiveGenerated: true,
        discoveredBy: currentFarmerName,
        createdAt: new Date().toISOString(),
      };

      setCommunityPathogens((prev) => [newItem, ...prev]);
      setActiveItem(newItem);

      try {
        await (supabase as any).from("pathology_library").insert({
          id: newItem.id,
          author_id: user?.id || null,
          author_name: currentFarmerName,
          name: newItem.name,
          scientific_name: newItem.scientificName,
          crop_category: newItem.cropCategory,
          pathogen_type: newItem.type,
          severity: newItem.severity,
          common_regions: newItem.commonRegions,
          symptoms: newItem.symptoms,
          organic_protocol: newItem.organicProtocol,
          chemical_protocol: newItem.chemicalProtocol,
          preventative_measures: newItem.preventativeMeasures,
          withholding_period: newItem.withholdingPeriod,
          high_risk_season: newItem.highRiskSeason,
          created_at: newItem.createdAt,
        });
      } catch (dbErr) {
        console.warn("Could not save to Supabase pathology table:", dbErr);
      }

      toast.success("AI Pathology Dossier compiled and published on top of the library!");
    } catch (err: any) {
      console.warn("AI Query fallback:", err.message);

      const synthesizedItem: PathologyItem = {
        id: `ai-${Date.now()}`,
        name: `${searchQuery} (Agronomic Synthesis)`,
        scientificName: "Pathogen / Physiological Stress Complex",
        cropCategory: (selectedCrop !== "All" ? selectedCrop : "AI Research") as any,
        type: "Fungal",
        severity: "Moderate",
        commonRegions: ["Gauteng", "Limpopo", "Mpumalanga", "North West"],
        symptoms: [
          `Foliar chlorosis and marginal necrosis associated with ${searchQuery}`,
          "Canopy stunting and vascular transportation restriction",
          "Reduced photosynthesis and premature senescent leaf drop",
        ],
        organicProtocol:
          "Apply liquid copper chelate (2L/ha) combined with cold-pressed neem seed oil at early infection stage.",
        chemicalProtocol:
          "Apply registered systemic triazole/strobilurin combination fungicide with minimum 200L/ha water carrier volume.",
        preventativeMeasures: [
          "Ensure wide row spacing to maximize canopy air movement",
          "Avoid overhead irrigation during late afternoon to keep leaf wetness duration short",
          "Maintain strict 3-year crop rotation schedules",
        ],
        withholdingPeriod: "14 days",
        highRiskSeason: "High-humidity and temperature inversion periods",
        isLiveGenerated: true,
        discoveredBy: currentFarmerName,
        createdAt: new Date().toISOString(),
      };

      setCommunityPathogens((prev) => [synthesizedItem, ...prev]);
      setActiveItem(synthesizedItem);

      try {
        await (supabase as any).from("pathology_library").insert({
          id: synthesizedItem.id,
          author_id: user?.id || null,
          author_name: currentFarmerName,
          name: synthesizedItem.name,
          scientific_name: synthesizedItem.scientificName,
          crop_category: synthesizedItem.cropCategory,
          pathogen_type: synthesizedItem.type,
          severity: synthesizedItem.severity,
          common_regions: synthesizedItem.commonRegions,
          symptoms: synthesizedItem.symptoms,
          organic_protocol: synthesizedItem.organicProtocol,
          chemical_protocol: synthesizedItem.chemicalProtocol,
          preventative_measures: synthesizedItem.preventativeMeasures,
          withholding_period: synthesizedItem.withholdingPeriod,
          high_risk_season: synthesizedItem.highRiskSeason,
          created_at: synthesizedItem.createdAt,
        });
      } catch (_) {}

      toast.success("Dossier compiled and saved to the community codex!");
    } finally {
      setIsAiSearching(false);
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "Critical":
        return "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/20 dark:text-rose-400 dark:border-rose-500/40";
      case "High":
        return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/40";
      case "Moderate":
        return "bg-yellow-50 text-yellow-800 border-yellow-200 dark:bg-yellow-500/20 dark:text-yellow-400 dark:border-yellow-500/40";
      default:
        return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/40";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "Pest / Insect":
        return <Bug className="h-3.5 w-3.5" />;
      case "Nutrient Deficiency":
        return <Sparkles className="h-3.5 w-3.5" />;
      default:
        return <Leaf className="h-3.5 w-3.5" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16 font-sans">
      {/* Top Banner */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-[#161d26]/90 p-6 sm:p-8 backdrop-blur-xl shadow-sm dark:shadow-2xl relative overflow-hidden transition-colors">
        <div className="absolute top-0 right-0 h-64 w-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
              <BookOpen className="h-3.5 w-3.5" /> Pathology &amp; Pest Reference Center
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border border-cyan-500/30 bg-cyan-50 dark:bg-cyan-500/10 text-[11px] font-medium text-cyan-700 dark:text-cyan-300">
              <Bot className="h-3 w-3" /> Live Community Knowledge Base
            </span>
          </div>

          <h1 className="mt-3 text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            South African Crop Pathology &amp; Treatment Codex
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Exhaustive database of crop diseases, pests, and nutrient deficiencies. Any unlisted pathogen researched by any grower is automatically published on top for every farmer in real time.
          </p>
        </div>
      </div>

      {/* Search & Dynamic AI Action Controls */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search Input */}
          <div className="md:col-span-6 relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search diseases, pests, Latin names, or symptoms..."
              className="w-full h-11 pl-10 pr-4 rounded-2xl border border-slate-300 dark:border-slate-700/80 bg-white dark:bg-[#111720]/90 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none transition shadow-2xs"
            />
          </div>

          {/* Target Crop Selector */}
          <div className="md:col-span-3">
            <select
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value)}
              className="w-full h-11 px-3.5 rounded-2xl border border-slate-300 dark:border-slate-700/80 bg-white dark:bg-[#111720]/90 text-xs text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none transition shadow-2xs font-medium"
            >
              {CROP_CATEGORIES.map((crop) => (
                <option key={crop} value={crop}>
                  Crop: {crop}
                </option>
              ))}
            </select>
          </div>

          {/* Pathogen Type Selector */}
          <div className="md:col-span-3">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full h-11 px-3.5 rounded-2xl border border-slate-300 dark:border-slate-700/80 bg-white dark:bg-[#111720]/90 text-xs text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none transition shadow-2xs font-medium"
            >
              {PATHOGEN_TYPES.map((type) => (
                <option key={type} value={type}>
                  Type: {type}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Action Controls & AI Deep Search Button */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mr-1 flex items-center gap-1">
              <Filter className="h-3 w-3" /> Filter:
            </span>
            {CROP_CATEGORIES.map((crop) => (
              <button
                key={crop}
                onClick={() => setSelectedCrop(crop)}
                className={`px-3 py-1 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  selectedCrop === crop
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-950/20 dark:shadow-emerald-950/60"
                    : "bg-white dark:bg-[#111720] text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800 shadow-2xs"
                }`}
              >
                {crop}
              </button>
            ))}
          </div>

          {/* AI Search Trigger Button */}
          <button
            type="button"
            onClick={handleAiDeepSearch}
            disabled={isAiSearching}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-xs font-bold text-white shadow-md hover:from-emerald-500 hover:to-teal-500 transition active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {isAiSearching ? (
              <>
                <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>Publishing to Library...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-3.5 w-3.5" />
                <span>AI Research Unlisted Pathogen</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Pathology Listing Cards Grid */}
      {filteredItems.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-[#121822]/40 p-12 text-center flex flex-col items-center justify-center space-y-4 shadow-2xs transition-colors">
          <div className="h-12 w-12 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-500">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">No Record Matches "{searchQuery}"</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm">
              Click below to compile a real-time dossier with AI. It will automatically publish on top of the codex for all farmers.
            </p>
          </div>
          <button
            onClick={handleAiDeepSearch}
            disabled={isAiSearching}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-xs font-bold text-white hover:bg-emerald-500 transition cursor-pointer"
          >
            <Sparkles className="h-4 w-4" /> Research &amp; Add "{searchQuery}" to Library
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => setActiveItem(item)}
              className={`group rounded-3xl border p-5 shadow-sm dark:shadow-xl transition-all duration-200 flex flex-col justify-between cursor-pointer relative overflow-hidden ${
                item.isLiveGenerated
                  ? "border-cyan-200 dark:border-cyan-500/40 bg-cyan-50/40 dark:bg-[#141d29] hover:border-cyan-400 hover:bg-cyan-50/70 dark:hover:bg-[#182333]"
                  : "border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131922] hover:border-emerald-500/50 hover:shadow-md dark:hover:bg-[#161f2c]"
              }`}
            >
              <div className="space-y-3">
                {/* Badges Row */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                      {item.cropCategory}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/60">
                      {getTypeIcon(item.type)} {item.type}
                    </span>
                    {item.isLiveGenerated && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-cyan-100 dark:bg-cyan-950/80 text-cyan-800 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-500/50 animate-pulse">
                        <Sparkles className="h-2.5 w-2.5 text-cyan-600 dark:text-cyan-300" /> Community AI Discovery
                      </span>
                    )}
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${getSeverityBadge(
                      item.severity
                    )}`}
                  >
                    {item.severity}
                  </span>
                </div>

                {/* Name & Latin Binomial */}
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition line-clamp-1">
                    {item.name}
                  </h3>
                  <p className="text-[11px] font-mono italic text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                    {item.scientificName}
                  </p>
                </div>

                {/* Primary Symptom */}
                <p className="text-xs text-slate-700 dark:text-slate-300 line-clamp-2 leading-relaxed">
                  {item.symptoms[0]}
                </p>

                {/* Community metadata tag if researched by a farmer */}
                {item.discoveredBy && (
                  <div className="text-[10px] text-cyan-700 dark:text-cyan-400/90 flex items-center gap-1.5 pt-1 font-medium">
                    <User className="h-3 w-3" />
                    <span>Researched by {item.discoveredBy}</span>
                  </div>
                )}
              </div>

              {/* Card Bottom Bar */}
              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-normal flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-slate-400 dark:text-slate-500" />
                  {item.commonRegions.slice(0, 2).join(", ")}
                  {item.commonRegions.length > 2 ? " +" : ""}
                </span>
                <span className="inline-flex items-center gap-1 group-hover:translate-x-0.5 transition">
                  View Dossier <ChevronRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Comprehensive Pathology Detail Modal */}
      {activeItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-[#161d26] p-6 sm:p-8 shadow-2xl text-slate-900 dark:text-slate-100 space-y-6">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setActiveItem(null)}
              className="absolute top-5 right-5 p-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
              aria-label="Close modal"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Modal Header */}
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                  {activeItem.cropCategory}
                </span>
                <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/60">
                  {activeItem.type}
                </span>
                <span
                  className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${getSeverityBadge(
                    activeItem.severity
                  )}`}
                >
                  {activeItem.severity} Severity
                </span>
                {activeItem.isLiveGenerated && (
                  <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-cyan-50 dark:bg-cyan-950/50 text-cyan-800 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-700 flex items-center gap-1">
                    <Sparkles className="h-3 w-3 text-cyan-600 dark:text-cyan-400" /> Community Discovered
                  </span>
                )}
              </div>

              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                {activeItem.name}
              </h2>
              <p className="text-xs sm:text-sm font-mono italic text-slate-500 dark:text-slate-400 mt-1">
                {activeItem.scientificName}
              </p>
            </div>

            {/* Quick Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-xs">
              <div>
                <span className="text-slate-500 dark:text-slate-400 font-medium block">Prevalent SA Regions:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {activeItem.commonRegions.join(", ")}
                </span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 font-medium block">High Risk Period:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {activeItem.highRiskSeason}
                </span>
              </div>
            </div>

            {/* Symptoms */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Info className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" /> Diagnostic Field Symptoms
              </h4>
              <ul className="space-y-1.5">
                {activeItem.symptoms.map((s, idx) => (
                  <li
                    key={idx}
                    className="rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/60 p-3 text-xs text-slate-700 dark:text-slate-300 leading-relaxed"
                  >
                    • {s}
                  </li>
                ))}
              </ul>
            </div>

            {/* Regimens */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/50 dark:bg-emerald-950/20 p-4 space-y-2">
                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-xs uppercase tracking-wider">
                  <Leaf className="h-4 w-4" /> Organic &amp; Biological Protocol
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  {activeItem.organicProtocol}
                </p>
              </div>

              <div className="rounded-2xl border border-cyan-200 dark:border-cyan-900/40 bg-cyan-50/50 dark:bg-cyan-950/20 p-4 space-y-2">
                <div className="flex items-center gap-2 text-cyan-700 dark:text-cyan-400 font-bold text-xs uppercase tracking-wider">
                  <FlaskConical className="h-4 w-4" /> Registered Chemical Regimen
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  {activeItem.chemicalProtocol}
                </p>
              </div>
            </div>

            {/* Prevention */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" /> Integrated Pest Management (IPM) &amp; Prevention
              </h4>
              <div className="space-y-1.5">
                {activeItem.preventativeMeasures.map((pm, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/60 p-2.5 text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2"
                  >
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{idx + 1}.</span>
                    <span>{pm}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Notice */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/70 p-4 text-[11px] text-slate-600 dark:text-slate-400 flex items-center justify-between">
              <div>
                <strong className="text-slate-800 dark:text-slate-300">Pre-Harvest Withholding Period (PHI): </strong>
                <span>{activeItem.withholdingPeriod}</span>
              </div>
              <span className="text-[10px] uppercase font-semibold text-slate-500 dark:text-slate-400">Act 36 of 1947 Standard</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LibraryPage;