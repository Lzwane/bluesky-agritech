import React, { createContext, useContext, useState } from "react";
import type { LanguageCode } from "./languages";

export interface Translations {
  nav_dashboard: string;
  nav_diagnosis: string;
  nav_library: string;
  nav_marketplace: string;
  nav_forum: string;
  nav_advisor: string;
  settings_title: string;
  settings_subtitle: string;
  full_name: string;
  farm_name: string;
  phone_number: string;
  province: string;
  language_select: string;
  save_button: string;
  saving: string;
  active_plan: string;
  upgrade_required_title: string;
  upgrade_required_desc: string;
  upgrade_btn: string;
  scan_limit_reached: string;
  research_limit_reached: string;
  listing_limit_reached: string;
  forum_post_limit_reached: string;
  advisor_limit_reached: string;
  
}

const TRANSLATIONS: Record<LanguageCode, Translations> = {
  en: {
    nav_dashboard: "Dashboard",
    nav_diagnosis: "Diagnosis",
    nav_library: "Library",
    nav_marketplace: "Marketplace",
    nav_forum: "Forum",
    nav_advisor: "Advisor",
    settings_title: "Profile & Subscription Settings",
    settings_subtitle: "Manage your farm details, primary language, visual theme, and active subscription plan.",
    full_name: "Full Name",
    farm_name: "Farm or Business Name",
    phone_number: "Phone Number",
    province: "Production Province",
    language_select: "Official Agricultural Language",
    save_button: "Save Profile Details",
    saving: "Saving Details...",
    active_plan: "Active Plan",
    upgrade_required_title: "Subscription Upgrade Required",
    upgrade_required_desc: "Your current free tier has reached its restriction limit. Please upgrade to Grower Pro (R100/mo) or Commercial Unlimited (R200/mo) to continue.",
    upgrade_btn: "Upgrade Plan",
    scan_limit_reached: "Monthly AI foliar scan limit reached (25/mo). Please upgrade your subscription.",
    research_limit_reached: "Monthly AI research quota reached (25/mo). Upgrade to Commercial Unlimited for unlimited queries.",
    listing_limit_reached: "Monthly marketplace listing limit reached (25/mo).",
    forum_post_limit_reached: "Free community tier can like and comment, but publishing posts requires Grower Pro or Commercial Unlimited.",
    advisor_limit_reached: "Daily free advisor limit reached (3/day). Upgrade to Grower Pro or Commercial Unlimited for unlimited chat.",
  },
  af: {
    nav_dashboard: "Tuisblad",
    nav_diagnosis: "Diagnose",
    nav_library: "Biblioteek",
    nav_marketplace: "Markplein",
    nav_forum: "Forum",
    nav_advisor: "Adviseur",
    settings_title: "Profiel en Intekening",
    settings_subtitle: "Bestuur jou plaasbesonderhede, taal, tema en intekening.",
    full_name: "Volle Naam",
    farm_name: "Plaas- of Besigheidsnaam",
    phone_number: "Foonnommer",
    province: "Produksieprovinsie",
    language_select: "Amptelike Landboustaal",
    save_button: "Stoor Profiel",
    saving: "Stoor tans...",
    active_plan: "Aktiewe Plan",
    upgrade_required_title: "Intekening Opgradering Benodig",
    upgrade_required_desc: "Jou huidige gratis vlak het sy perk bereik. Gradeer asseblief op na Grower Pro (R100/md) of Commercial Unlimited (R200/md) om voort te gaan.",
    upgrade_btn: "Gradeer Plan Op",
    scan_limit_reached: "Maandelikse KI-blaar skandering perk bereik (25/md). Gradeer asseblief jou intekening op.",
    research_limit_reached: "Maandelikse KI-navorsingskwota bereik (25/md).",
    listing_limit_reached: "Maandelikse markplein plasingsperk bereik (25/md).",
    forum_post_limit_reached: "Gratis gemeenskapvlak kan hou van en kommentaar lewer, maar plasings vereis Grower Pro of Commercial Unlimited.",
    advisor_limit_reached: "Daaglikse gratis adviseur limiet bereik (3/dag). Gradeer op vir onbeperkte gesels.",
  },
  zu: {
    nav_dashboard: "Ikhasi",
    nav_diagnosis: "Ukuhlola",
    nav_library: "Umtapo",
    nav_marketplace: "Imakethe",
    nav_forum: "Inkundla",
    nav_advisor: "Umuleli",
    settings_title: "Iphrofayela Nemali",
    settings_subtitle: "Phatha imininingwane yepulazi lakho, ulimi, kanye nohlelo.",
    full_name: "Igama Eliphelele",
    farm_name: "Igama Lepulazi",
    phone_number: "Inombolo Yocingo",
    province: "Isifunda",
    language_select: "Ulimi Lwezolimo",
    save_button: "Gcina Iphrofayela",
    saving: "Kuyagcinwa...",
    active_plan: "Uhlelo Olusebenzayo",
    upgrade_required_title: "Kudingeka Ukuthuthukisa Uhlelo",
    upgrade_required_desc: "Izinga lakho lamahhala selifinyelele umkhawulo walo. Sicela uthuthukisele ku-Grower Pro noma Commercial Unlimited.",
    upgrade_btn: "Thuthukisa Uhlelo",
    scan_limit_reached: "Umkhawulo wokuhlola wenyanga usufinyelelwe (25/ngenyanga).",
    research_limit_reached: "Umkhawulo wocwaningo lwenyanga usufinyelelwe (25/ngenyanga).",
    listing_limit_reached: "Umkhawulo wemakethe wenyanga usufinyelelwe (25/ngenyanga).",
    forum_post_limit_reached: "Izinga lamahhala lingathanda futhi liphawule, kodwa ukushicilela okuthunyelwe kudinga i-Grower Pro.",
    advisor_limit_reached: "Umkhawulo wansuku zonke womeluleki usufinyelelwe (3/ngosuku).",
  },
  xh: {
    nav_dashboard: "Iphepha",
    nav_diagnosis: "Ukuvavanya",
    nav_library: "Amathala",
    nav_marketplace: "Iimarike",
    nav_forum: "Iforum",
    nav_advisor: "Umcebisi",
    settings_title: "Iprofayile noBhaliso",
    settings_subtitle: "Lawula iinkcukacha zefama yakho.",
    full_name: "Igama Elipheleleyo",
    farm_name: "Igama Lefama",
    phone_number: "Inombolo Yefowuni",
    province: "Iphondo",
    language_select: "Ulwimi LwezoLimo",
    save_button: "Gcina Iprofayile",
    saving: "Iyagcinwa...",
    active_plan: "Isicwangciso Esinamandla",
    upgrade_required_title: "Kufuneka Uphucule Isicwangciso",
    upgrade_required_desc: "Inqanaba lakho lasimahla lifikelele kumda walo. Nceda uphucule uqhagamshelwano lwakho.",
    upgrade_btn: "Phucula Isicwangciso",
    scan_limit_reached: "Umda wokuhlola wenyanga ufikelelwe (25/ngenyanga).",
    research_limit_reached: "Umda wophando lwenyanga ufikelelwe (25/ngenyanga).",
    listing_limit_reached: "Umda wemarike wenyanga ufikelelwe (25/ngenyanga).",
    forum_post_limit_reached: "Inqanaba lasimahla linokuthanda kodwa ukuthumela kufuna uPhuculo.",
    advisor_limit_reached: "Umda wemihla ngemihla womcebisi ufikelelwe (3/ngosuku).",
  },
  nso: {
    nav_dashboard: "Phanele",
    nav_diagnosis: "Tlhatlhobo",
    nav_library: "Laeborari",
    nav_marketplace: "Mmaraka",
    nav_forum: "Foramo",
    nav_advisor: "Moletši",
    settings_title: "Dipeakanyo tša Profaelo",
    settings_subtitle: "Laola dintlha tša polasa ya gago.",
    full_name: "Leina ka Botlalo",
    farm_name: "Leina la Polasa",
    phone_number: "Nomoro ya Mogala",
    province: "Porofense",
    language_select: "Leleme la Temothuo",
    save_button: "Boloka Profaelo",
    saving: "E boloka...",
    active_plan: "Lenaneo la Gago",
    upgrade_required_title: "Go Hlokega Tokafatšo ya Lenaneo",
    upgrade_required_desc: "Maemo a gago a mahala a fihlile mo go felelago teng. Hle tokafatsa go ya go Grower Pro.",
    upgrade_btn: "Tokafatša Lenaneo",
    scan_limit_reached: "Tlhatlhobo ya kgwedi e fihlile mo mafelelong (25/kgwedi).",
    research_limit_reached: "Nyakišišo ya kgwedi e fihlile mo mafelelong (25/kgwedi).",
    listing_limit_reached: "Dintlha tša mmaraka di fihlile mo mafelelong.",
    forum_post_limit_reached: "Maemo a mahala a dumelela go rata, eupša go romela go nyaka tokafatšo.",
    advisor_limit_reached: "Moletši wa letšatši o fihlile mo mafelelong (3/letšatši).",
  },
  st: {
    nav_dashboard: "Dashboard",
    nav_diagnosis: "Tlahlobo",
    nav_library: "Laeborari",
    nav_marketplace: "Mmaraka",
    nav_forum: "Foramo",
    nav_advisor: "Moeletsi",
    settings_title: "Litlhophiso tsa Profaele",
    settings_subtitle: "Laola lintlha tsa polasi.",
    full_name: "Lebitso le Feletseng",
    farm_name: "Lebitso la Polasi",
    phone_number: "Nomoro ea Mohala",
    province: "Porofense",
    language_select: "Puo ea Temo",
    save_button: "Boloka",
    saving: "Ea boloka...",
    active_plan: "Leano le Sebetsang",
    upgrade_required_title: "Ho Hlokahala Ntlafatso ea Leano",
    upgrade_required_desc: "Boemo ba hau ba mahala bo fihlile mo moeding. Ka kopo ntlafatsa.",
    upgrade_btn: "Ntlafatsa Leano",
    scan_limit_reached: "Moeli oa hlahlobo ea khoeli o fihlile.",
    research_limit_reached: "Moeli oa lipatlisiso oa khoeli o fihlile.",
    listing_limit_reached: "Moeli oa mmaraka o fihlile.",
    forum_post_limit_reached: "Boemo ba mahala bo lumella ho rata feela.",
    advisor_limit_reached: "Moeli oa letsatsi oa moeletsi o fihlile (3/letsatsi).",
  },
  tn: {
    nav_dashboard: "Dashboard",
    nav_diagnosis: "Tlhatlhobo",
    nav_library: "Laeborari",
    nav_marketplace: "Mmaraka",
    nav_forum: "Foramo",
    nav_advisor: "Motlhodi",
    settings_title: "Dipego tsa Porofaelo",
    settings_subtitle: "Laola dintlha tsa polase.",
    full_name: "Leina le le Feletseng",
    farm_name: "Leina la Polase",
    phone_number: "Nomoro ya Mogala",
    province: "Porofense",
    language_select: "Loleme la Temothuo",
    save_button: "Boloka",
    saving: "E boloka...",
    active_plan: "Lenaneo le le Dirang",
    upgrade_required_title: "Go Tlhokega Tokafatso ya Lenaneo",
    upgrade_required_desc: "Maemo a gago a mahala a fensitse. Tsweetswee tokafatsa.",
    upgrade_btn: "Tokafatša Lenaneo",
    scan_limit_reached: "Telatelo ya kgwedi e fensitse.",
    research_limit_reached: "Patlisiso ya kgwedi e fensitse.",
    listing_limit_reached: "Mmaraka o fensitse.",
    forum_post_limit_reached: "Maemo a mahala a letlelela go rata fela.",
    advisor_limit_reached: "Motlhodi wa letsatsi o fensitse (3/letsatsi).",
  },
  ss: {
    nav_dashboard: "Luhlolomvulo",
    nav_diagnosis: "Kuhlola",
    nav_library: "Lemtapo",
    nav_marketplace: "Imakethe",
    nav_forum: "Sigungu",
    nav_advisor: "Umuleli",
    settings_title: "Emalungiselelo",
    settings_subtitle: "Phatha imininingwane yelifama.",
    full_name: "Ligama Leliphelele",
    farm_name: "Ligama Lelifama",
    phone_number: "Inombolo Yelucono",
    province: "Sifundza",
    language_select: "Lulimi Lwetemnotfo",
    save_button: "Gcina",
    saving: "Kuyagcinwa...",
    active_plan: "Uhlelo Lolusebenta",
    upgrade_required_title: "Kudingeka Kutfutfukiswa",
    upgrade_required_desc: "Sigaba sakho samahhala siphelile. Sicela utfutfukise.",
    upgrade_btn: "Utfutfukise Uhlelo",
    scan_limit_reached: "Umkhawulo wokuhlola wenyanga uphelile.",
    research_limit_reached: "Umkhawulo wemibuto uphelile.",
    listing_limit_reached: "Umkhawulo wemakethe uphelile.",
    forum_post_limit_reached: "Sigaba samahhala sivumela kuthandza kuphela.",
    advisor_limit_reached: "Umkhawulo wencociswano uphelile (3/lilanga).",
  },
  ts: {
    nav_dashboard: "Dashboard",
    nav_diagnosis: "Miringo",
    nav_library: "Layiburari",
    nav_marketplace: "Makete",
    nav_forum: "Foramu",
    nav_advisor: "Muelisi",
    settings_title: "Swiyimo swa Akhawunti",
    settings_subtitle: "Languta Vuxokoxoko bya fole.",
    full_name: "Vito ra Xipano",
    farm_name: "Vito ra Fole",
    phone_number: "Nomboro ya Thelevhixini",
    province: "Xifundzankulu",
    language_select: "Ririmi ra Vurimi",
    save_button: "Hlayisa",
    saving: "Yi hlayisa...",
    active_plan: "Pulani",
    upgrade_required_title: "Ku Lava Kuantsisa Pulani",
    upgrade_required_desc: "Xiyimo xa mahala xi hetisekile. Hi kombela u antsisa.",
    upgrade_btn: "Antsisa Pulani",
    scan_limit_reached: "Mpimo wa miringo ya nwheti wu hetisekile.",
    research_limit_reached: "Mpimo wa ndzavisiso wu hetisekile.",
    listing_limit_reached: "Mpimo wa makete wu hetisekile.",
    forum_post_limit_reached: "Xiyimo xa mahala xi pfumelela ku rhandza ntsena.",
    advisor_limit_reached: "Mpimo wa siku ra muelisi wu hetisekile (3/siku).",
  },
  nr: {
    nav_dashboard: "Dashboard",
    nav_diagnosis: "Ukuhlola",
    nav_library: "UMtapo",
    nav_marketplace: "Imakethe",
    nav_forum: "Inkundla",
    nav_advisor: "Umuleli",
    settings_title: "Iprofayili",
    settings_subtitle: "Lawula imininingwane",
    full_name: "Igama eliphelelelako",
    farm_name: "Igama lephasi",
    phone_number: "Inombolo",
    province: "Isifunda",
    language_select: "Ulwimi",
    save_button: "Gcina",
    saving: "Iyagcina...",
    active_plan: "Uhlelo",
    upgrade_required_title: "Kudingeka Ukuthuthukisa",
    upgrade_required_desc: "Izinga lakho lamahhala liphelile. Sicela uthuthukise.",
    upgrade_btn: "Thuthukisa",
    scan_limit_reached: "Umkhawulo wokuhlola wenyanhla uphelile.",
    research_limit_reached: "Umkhawulo wocwaningo uphelile.",
    listing_limit_reached: "Umkhawulo wemakethe uphelile.",
    forum_post_limit_reached: "Izinga lamahhala livumela ukuthanda kuphela.",
    advisor_limit_reached: "Umkhawulo wamalanga uphelile (3/ngosuku).",
  },
  ve: {
    nav_dashboard: "Dashibodo",
    nav_diagnosis: "Vhuṱolo",
    nav_library: "Laeborari",
    nav_marketplace: "Mmaraka",
    nav_forum: "Foramo",
    nav_advisor: "Muledeli",
    settings_title: "Zwirengedzwa",
    settings_subtitle: "Langa zwa purasi",
    full_name: "Dzina ḽo fhelelaho",
    farm_name: "Dzina ḽa purasi",
    phone_number: "Nomboro",
    province: "Profini",
    language_select: "Luvhi",
    save_button: "Vhulunga",
    saving: "Zwi vhulunga...",
    active_plan: "Pulani",
    upgrade_required_title: "Zwo Laedhwa u Khwinisa Pulani",
    upgrade_required_desc: "Tshigaba tsha mahala tsho fhela. Nnyi khwinise.",
    upgrade_btn: "Khwinisa Pulani",
    scan_limit_reached: "Tshikalo tsha vhuṱolo tsho fhela.",
    research_limit_reached: "Tshikalo tsha ṱhodisiso tsho fhela.",
    listing_limit_reached: "Tshikalo tsha mmaraka tsho fhela.",
    forum_post_limit_reached: "Tshigaba tsha mahala tshi tendela u funa fhedzi.",
    advisor_limit_reached: "Tshikalo tsha duvha tsho fhela (3/duvha).",
  },
};

const LanguageContext = createContext<{
  language: LanguageCode;
  setLanguage: (code: LanguageCode) => void;
  t: (key: keyof Translations) => string;
}>({
  language: "en",
  setLanguage: () => {},
  t: (k) => TRANSLATIONS["en"][k] || k,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("bluesky_preferred_lang") as LanguageCode) || "en";
    }
    return "en";
  });

  const setLanguage = (code: LanguageCode) => {
    setLanguageState(code);
    if (typeof window !== "undefined") {
      localStorage.setItem("bluesky_preferred_lang", code);
    }
  };

  const t = (key: keyof Translations) => {
    const dictionary = TRANSLATIONS[language] || TRANSLATIONS["en"];
    return dictionary[key] || TRANSLATIONS["en"][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);