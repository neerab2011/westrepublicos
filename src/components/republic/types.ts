export type Operator = {
  id: string;
  name: string;
  role: string;
  clearance: string;
  station: string;
};

export const STATION = "Republic Sector: Proxima-9 (West Delhi Hub)";

const FIRST_NAMES = [
  "Rajesh", "Ananya", "Vikram", "Sunita", "Arjun", "Priya", "Karthik",
  "Meera", "Rohan", "Divya", "Aditya", "Kavya", "Sanjay", "Ishita",
  "Manish", "Pooja", "Nikhil", "Riya", "Aakash", "Neha", "Harsh",
  "Tanvi", "Yash", "Sneha", "Aryan", "Aisha", "Dev", "Lakshmi",
];
const LAST_NAMES = [
  "Sharma", "Verma", "Iyer", "Reddy", "Khan", "Patel", "Singh",
  "Gupta", "Joshi", "Mehta", "Nair", "Kapoor", "Bose", "Rao",
];

export function randomCrewName(): string {
  const i = Math.floor(Math.random() * FIRST_NAMES.length);
  const j = Math.floor(Math.random() * LAST_NAMES.length);
  return FIRST_NAMES[i] + " " + LAST_NAMES[j];
}

export const OPERATORS: Operator[] = [
  { id: "101", name: "CMDR. Rajesh Sharma",  role: "Civic Operations",   clearance: "OMEGA", station: "MISSION CTRL · DWARKA" },
  { id: "102", name: "LT. Ananya Iyer",      role: "Resource Logistics", clearance: "DELTA", station: "SUPPLY BAY · SECTOR 21" },
  { id: "103", name: "ENS. Vikram Verma",    role: "Citizen Liaison",    clearance: "GAMMA", station: "PUBLIC FORUM · SECTOR 12" },
  { id: "104", name: "DR. Sunita Reddy",     role: "Wellness Division",  clearance: "BETA",  station: "MED-BAY · SECTOR 9" },
  { id: "105", name: "ENG. Arjun Khan",      role: "Grid Engineering",   clearance: "ALPHA", station: "GRID OPS · BIJWASAN" },
  { id: "106", name: "OFC. Priya Patel",     role: "Public Records",     clearance: "GAMMA", station: "ARCHIVES · SECTOR 6" },
];

export type Mission = {
  id: string;
  category: "LOGISTICS" | "MEDICAL" | "ENGINEERING" | "SECURITY" | "CIVIC";
  title: string;
  location: string;
  priority: "HIGH" | "MED" | "LOW";
  needCrew: number;
  details: string;
  sector: string;
};

export const MISSIONS: Mission[] = [
  // Dwarka — 12 missions
  { id: "M-DW-101", category: "LOGISTICS",   title: "Bijwasan Toll Plaza Backup",         location: "NH-248BB · Bijwasan",       priority: "HIGH", needCrew: 6, details: "Heavy backup at gates 3-7. Help marshals divert traffic to service lane.", sector: "dwarka" },
  { id: "M-DW-102", category: "MEDICAL",     title: "Sector 9 Hospital OPD Surge",        location: "Manipal · Sector 6/9",      priority: "HIGH", needCrew: 4, details: "Triage volunteers and wheelchair runners needed at gate B.", sector: "dwarka" },
  { id: "M-DW-103", category: "ENGINEERING", title: "Sector 21 Street Light Sync",        location: "Sector 21 Ring Road",       priority: "MED",  needCrew: 3, details: "Re-sync 14 pole controllers. Report flicker on Pole 21-B-07.", sector: "dwarka" },
  { id: "M-DW-104", category: "SECURITY",    title: "Shyam Vihar Night Patrol",           location: "Sector 23 · Shyam Vihar",   priority: "MED",  needCrew: 4, details: "Two-person teams. Report idle vehicles to Channel 04.", sector: "dwarka" },
  { id: "M-DW-105", category: "CIVIC",       title: "Sector 10 Water Tanker Schedule",    location: "Sector 10 Pocket A",        priority: "LOW",  needCrew: 2, details: "Schedule 6 tankers across 4 societies.", sector: "dwarka" },
  { id: "M-DW-106", category: "ENGINEERING", title: "Metro Sector 21 Lift Maintenance",   location: "DMRC Sector 21",            priority: "LOW",  needCrew: 2, details: "Help DMRC redirect passengers 23:00-04:00.", sector: "dwarka" },
  { id: "M-DW-107", category: "LOGISTICS",   title: "Sector 12 Market Vendor Overflow",   location: "Sector 12 Main Market",     priority: "HIGH", needCrew: 5, details: "Weekend overflow. Redirect vendors to temporary stalls in Sector 11.", sector: "dwarka" },
  { id: "M-DW-108", category: "MEDICAL",     title: "Sector 7 Dengue Fogging Drive",      location: "Sector 7 · All Blocks",     priority: "MED",  needCrew: 4, details: "MCD fogging team needs volunteers to ensure no standing water left behind.", sector: "dwarka" },
  { id: "M-DW-109", category: "CIVIC",       title: "Sector 3 RWA Election Support",      location: "Sector 3 Community Hall",   priority: "LOW",  needCrew: 3, details: "Ballot distribution, counting, and result announcement assistance.", sector: "dwarka" },
  { id: "M-DW-110", category: "SECURITY",    title: "Dwarka Expressway Accident Zone",    location: "Expressway · KM 14",        priority: "HIGH", needCrew: 6, details: "Multi-vehicle pile-up. Traffic diversion and first-aid required urgently.", sector: "dwarka" },
  { id: "M-DW-111", category: "ENGINEERING", title: "Sector 6 Underground Cable Repair",  location: "Sector 6 · Block B",        priority: "MED",  needCrew: 3, details: "BSES reported cable fault. Coordinate road closure and repair crew access.", sector: "dwarka" },
  { id: "M-DW-112", category: "LOGISTICS",   title: "Sector 14 School Bus Re-routing",    location: "Sector 14 · DPS Gate",      priority: "LOW",  needCrew: 2, details: "Road resurfacing requires temporary bus route via Sector 13 ring.", sector: "dwarka" },

  // Janakpuri — 11 missions
  { id: "M-JK-201", category: "LOGISTICS",   title: "Pankha Road Market Congestion",      location: "Pankha Road · C-Block",     priority: "HIGH", needCrew: 5, details: "Weekend market overflow. Redirect foot traffic via D-Block.", sector: "janakpuri" },
  { id: "M-JK-202", category: "MEDICAL",     title: "District Centre Blood Camp",          location: "Janakpuri District Centre",priority: "MED",  needCrew: 3, details: "Volunteer registration and donor management.", sector: "janakpuri" },
  { id: "M-JK-203", category: "CIVIC",       title: "C-Block Park Renovation",            location: "C-Block Community Park",    priority: "LOW",  needCrew: 4, details: "Plant 200 saplings, install 8 benches.", sector: "janakpuri" },
  { id: "M-JK-204", category: "SECURITY",    title: "A-Block ATM Surveillance Setup",     location: "A-Block Market · SBI ATM",  priority: "HIGH", needCrew: 3, details: "Install 4 CCTV cameras around ATM cluster after repeated card-skimming incidents.", sector: "janakpuri" },
  { id: "M-JK-205", category: "ENGINEERING", title: "B-Block Sewer Overflow",             location: "B-Block Lane 2",            priority: "HIGH", needCrew: 4, details: "Sewage overflow after heavy rain. Pump deployment and DJB coordination needed.", sector: "janakpuri" },
  { id: "M-JK-206", category: "LOGISTICS",   title: "Janakpuri West Metro Crowd Control", location: "DMRC Janakpuri West",       priority: "MED",  needCrew: 4, details: "Peak-hour crowd management at platform 2 and exit gate B.", sector: "janakpuri" },
  { id: "M-JK-207", category: "CIVIC",       title: "D-Block Senior Citizen Health Camp", location: "D-Block Community Hall",    priority: "LOW",  needCrew: 3, details: "Free BP/sugar check. Coordinate with Safdarjung Hospital mobile unit.", sector: "janakpuri" },
  { id: "M-JK-208", category: "MEDICAL",     title: "Pankha Road Accident Response",      location: "Pankha Road · Flyover Base",priority: "HIGH", needCrew: 5, details: "Motorcycle vs auto collision. First-aid and police coordination required.", sector: "janakpuri" },
  { id: "M-JK-209", category: "ENGINEERING", title: "E-Block Transformer Replacement",    location: "E-Block · Pocket 3",        priority: "MED",  needCrew: 3, details: "BSES replacing 500kVA transformer. 6-hour scheduled outage management.", sector: "janakpuri" },
  { id: "M-JK-210", category: "SECURITY",    title: "District Centre Night Market Patrol", location: "District Centre · South Wing", priority: "MED", needCrew: 3, details: "Late-night market vendor safety patrol. Report suspicious activity to CH-04.", sector: "janakpuri" },
  { id: "M-JK-211", category: "LOGISTICS",   title: "Tilak Nagar-Janakpuri Bus Depot Sync", location: "DTC Depot · Janakpuri",   priority: "LOW",  needCrew: 2, details: "Coordinate schedule alignment between depots for Route 522.", sector: "janakpuri" },

  // Vikaspuri — 11 missions
  { id: "M-VP-301", category: "ENGINEERING", title: "Block A Sewer Line Repair",           location: "Vikas Marg · Block A",      priority: "HIGH", needCrew: 4, details: "Emergency repair on collapsed sewer line. Traffic diversion needed.", sector: "vikaspuri" },
  { id: "M-VP-302", category: "SECURITY",    title: "Mohan Garden Night Watch",            location: "Mohan Garden Road",         priority: "MED",  needCrew: 3, details: "Patrol Mohan Garden to Uttam Nagar stretch.", sector: "vikaspuri" },
  { id: "M-VP-303", category: "LOGISTICS",   title: "Block C Market Road Resurfacing",    location: "Block C · Main Road",       priority: "MED",  needCrew: 4, details: "PWD resurfacing work. Manage vendor relocation and pedestrian diversion.", sector: "vikaspuri" },
  { id: "M-VP-304", category: "MEDICAL",     title: "Block D Vaccination Drive",          location: "Block D · Community Centre", priority: "HIGH", needCrew: 5, details: "Pulse polio + COVID booster camp. Queue management and cold chain support.", sector: "vikaspuri" },
  { id: "M-VP-305", category: "CIVIC",       title: "Vikaspuri Lake Cleanup",             location: "Vikaspuri Lake",            priority: "LOW",  needCrew: 6, details: "Weekly cleanup drive. Remove floating debris, plant aquatic vegetation.", sector: "vikaspuri" },
  { id: "M-VP-306", category: "ENGINEERING", title: "KK Tower Lift Malfunction",          location: "KK Tower · Block B",        priority: "HIGH", needCrew: 2, details: "Elevator stuck between floors 7-8. Fire service contacted. Crowd management needed.", sector: "vikaspuri" },
  { id: "M-VP-307", category: "LOGISTICS",   title: "Uttam Nagar East Metro Parking",     location: "Metro Station · East Gate", priority: "MED",  needCrew: 3, details: "Unauthorized parking blocking emergency lane. Tow coordination needed.", sector: "vikaspuri" },
  { id: "M-VP-308", category: "SECURITY",    title: "Block E Stray Dog Incident",         location: "Block E · Lane 5",          priority: "MED",  needCrew: 2, details: "Aggressive stray pack reported. MCD dog-catcher unit en route. Area management.", sector: "vikaspuri" },
  { id: "M-VP-309", category: "CIVIC",       title: "Janakpuri-Vikaspuri Bridge Survey",  location: "Outer Ring Road Bridge",    priority: "LOW",  needCrew: 3, details: "Structural survey assistance for PWD bridge inspection team.", sector: "vikaspuri" },
  { id: "M-VP-310", category: "MEDICAL",     title: "Block A Elderly Fall Response",      location: "Block A · House 47",        priority: "HIGH", needCrew: 2, details: "Elderly resident fall reported. First-aid and ambulance escort needed.", sector: "vikaspuri" },
  { id: "M-VP-311", category: "ENGINEERING", title: "Block F Waterlogging Pump Deploy",   location: "Block F · Main Drain",      priority: "MED",  needCrew: 3, details: "Post-rain waterlogging. Deploy 3 pumps and clear drain grates.", sector: "vikaspuri" },

  // Rajouri Garden — 11 missions
  { id: "M-RG-401", category: "LOGISTICS",   title: "TDI Mall Parking Overflow",          location: "TDI Mall Junction",         priority: "MED",  needCrew: 3, details: "Redirect overflow parking to Tagore Garden lot.", sector: "rajouri-garden" },
  { id: "M-RG-402", category: "CIVIC",       title: "Mayapuri Industrial Cleanup",        location: "Mayapuri Industrial Area",  priority: "LOW",  needCrew: 5, details: "Weekly cleanup drive. Coordinate with MCD trucks.", sector: "rajouri-garden" },
  { id: "M-RG-403", category: "SECURITY",    title: "Metro Station Pickpocket Alert",     location: "Rajouri Garden Metro",      priority: "HIGH", needCrew: 4, details: "Spike in pickpocket reports at entry gate. Plainclothes patrol requested.", sector: "rajouri-garden" },
  { id: "M-RG-404", category: "MEDICAL",     title: "J-Block Free Eye Camp",             location: "J-Block · Gurudwara Hall",  priority: "MED",  needCrew: 3, details: "AIIMS mobile eye unit. Patient registration and spectacle distribution.", sector: "rajouri-garden" },
  { id: "M-RG-405", category: "ENGINEERING", title: "Najafgarh Road Pothole Emergency",  location: "Najafgarh Rd · Tagore Garden", priority: "HIGH", needCrew: 3, details: "3 large potholes causing accidents. Emergency patching and barrier placement.", sector: "rajouri-garden" },
  { id: "M-RG-406", category: "LOGISTICS",   title: "Rajouri Garden Main Market Survey", location: "Main Market · Block A",     priority: "LOW",  needCrew: 2, details: "Fire safety compliance check for 40 shops. Document and report violations.", sector: "rajouri-garden" },
  { id: "M-RG-407", category: "CIVIC",       title: "Tagore Garden Extension RWA Meet",  location: "Tagore Garden Ext · Park",  priority: "LOW",  needCrew: 2, details: "Setup PA system, chairs, and attendance register for quarterly RWA meeting.", sector: "rajouri-garden" },
  { id: "M-RG-408", category: "SECURITY",    title: "Mayapuri Phase II Night Patrol",    location: "Mayapuri Phase II",         priority: "MED",  needCrew: 4, details: "Industrial area night security sweep. Report unauthorized activity.", sector: "rajouri-garden" },
  { id: "M-RG-409", category: "MEDICAL",     title: "Ring Road Accident Multi-Casualty",  location: "Ring Road · Moti Nagar Flyover", priority: "HIGH", needCrew: 6, details: "Bus-truck collision. Mass casualty triage and traffic rerouting needed.", sector: "rajouri-garden" },
  { id: "M-RG-410", category: "ENGINEERING", title: "H-Block Water Main Burst",          location: "H-Block · Lane 3",          priority: "HIGH", needCrew: 4, details: "Major water main burst flooding road. DJB crew en route, crowd and traffic management.", sector: "rajouri-garden" },
  { id: "M-RG-411", category: "LOGISTICS",   title: "Rajouri Metro Line Extension Work",  location: "Metro Construction Site",   priority: "MED",  needCrew: 3, details: "Barricade maintenance and pedestrian diversion around construction zone.", sector: "rajouri-garden" },

  // Punjabi Bagh — 11 missions
  { id: "M-PB-501", category: "MEDICAL",     title: "Rohtak Road Accident Response",      location: "Rohtak Road · Madipur",     priority: "HIGH", needCrew: 4, details: "Multi-vehicle collision. First-aid and traffic control.", sector: "punjabi-bagh" },
  { id: "M-PB-502", category: "ENGINEERING", title: "Club Road Waterlogging",             location: "Ring Road · Club Area",     priority: "MED",  needCrew: 3, details: "Pump deployment and drain clearing after heavy rain.", sector: "punjabi-bagh" },
  { id: "M-PB-503", category: "LOGISTICS",   title: "West Punjabi Bagh Market Rush",     location: "Club Road · West Side",     priority: "HIGH", needCrew: 5, details: "Festival season market overflow. Crowd barriers and marshal deployment.", sector: "punjabi-bagh" },
  { id: "M-PB-504", category: "SECURITY",    title: "Saraswati Vihar ATM Cluster Watch",  location: "Saraswati Vihar · Main Road", priority: "MED", needCrew: 3, details: "Night security patrol for ATM corridor after robbery attempt.", sector: "punjabi-bagh" },
  { id: "M-PB-505", category: "CIVIC",       title: "Ring Road Flyover Beautification",   location: "Ring Road · Flyover Pillars", priority: "LOW", needCrew: 4, details: "Community mural painting on flyover pillars. Coordinate with artists and traffic.", sector: "punjabi-bagh" },
  { id: "M-PB-506", category: "MEDICAL",     title: "East Punjabi Bagh Dengue Survey",   location: "East PB · Blocks 20-25",   priority: "MED",  needCrew: 4, details: "Door-to-door larval survey and awareness pamphlet distribution.", sector: "punjabi-bagh" },
  { id: "M-PB-507", category: "ENGINEERING", title: "Madipur Industrial Gas Leak",       location: "Madipur Industrial Area",   priority: "HIGH", needCrew: 5, details: "Minor gas leak detected at factory unit 7. Evacuate 50m radius, NDRF notified.", sector: "punjabi-bagh" },
  { id: "M-PB-508", category: "LOGISTICS",   title: "Shivaji Park Sports Day Setup",     location: "Shivaji Park · PB",         priority: "LOW",  needCrew: 3, details: "Setup running track markers, water stations, and PA system for inter-colony sports.", sector: "punjabi-bagh" },
  { id: "M-PB-509", category: "SECURITY",    title: "Club Road VIP Movement Escort",     location: "Club Road · Full Stretch",  priority: "HIGH", needCrew: 6, details: "VIP convoy transit 14:00-15:30. Road clearance and traffic hold required.", sector: "punjabi-bagh" },
  { id: "M-PB-510", category: "CIVIC",       title: "Punjabi Bagh Lake Revival Meeting", location: "PB Lake · North Gate",      priority: "LOW",  needCrew: 2, details: "Public consultation on lake restoration plan. Feedback collection and documentation.", sector: "punjabi-bagh" },
  { id: "M-PB-511", category: "ENGINEERING", title: "ESI Hospital Power Backup Test",    location: "ESI Hospital · PB",         priority: "MED",  needCrew: 2, details: "Scheduled DG set testing. Ensure UPS switchover for critical units.", sector: "punjabi-bagh" },

  // Tilak Nagar — 11 missions
  { id: "M-TN-601", category: "LOGISTICS",   title: "Subhash Nagar Metro Crowd",         location: "Najafgarh Rd · Subhash Nagar", priority: "HIGH", needCrew: 4, details: "Peak hour crowd management at metro entry/exit.", sector: "tilak-nagar" },
  { id: "M-TN-602", category: "CIVIC",       title: "Kirti Nagar Furniture Market Survey", location: "Kirti Nagar Industrial",  priority: "LOW",  needCrew: 2, details: "Vendor compliance survey and fire safety check.", sector: "tilak-nagar" },
  { id: "M-TN-603", category: "SECURITY",    title: "Tilak Nagar Market Chain Snatching",  location: "Tilak Nagar Main Market",  priority: "HIGH", needCrew: 4, details: "Spike in chain-snatching. Evening patrol with police coordination.", sector: "tilak-nagar" },
  { id: "M-TN-604", category: "MEDICAL",     title: "Subhash Nagar Clinic Overload",     location: "Subhash Nagar · Govt Clinic", priority: "MED", needCrew: 3, details: "OPD overflow due to seasonal flu. Queue management and patient triage.", sector: "tilak-nagar" },
  { id: "M-TN-605", category: "ENGINEERING", title: "Tilak Nagar Flyover Joint Repair",  location: "Tilak Nagar Flyover",       priority: "MED",  needCrew: 3, details: "Expansion joint failure. Night repair crew access and traffic diversion.", sector: "tilak-nagar" },
  { id: "M-TN-606", category: "LOGISTICS",   title: "Kirti Nagar Exhibition Ground Setup", location: "ITPO Ground · Kirti Nagar", priority: "LOW", needCrew: 5, details: "Trade fair setup support. Stall layout, power connection, and signage.", sector: "tilak-nagar" },
  { id: "M-TN-607", category: "CIVIC",       title: "Moti Nagar Community Garden",       location: "Moti Nagar · Plot 14",     priority: "LOW",  needCrew: 3, details: "Convert vacant plot to community garden. Soil prep and sapling planting.", sector: "tilak-nagar" },
  { id: "M-TN-608", category: "SECURITY",    title: "Kirti Nagar Industrial Fire Watch", location: "Kirti Nagar Industrial",    priority: "HIGH", needCrew: 4, details: "Fire safety audit found violations in 12 units. Standby with fire dept.", sector: "tilak-nagar" },
  { id: "M-TN-609", category: "MEDICAL",     title: "Moti Nagar Road Accident",          location: "Najafgarh Rd · Moti Nagar", priority: "HIGH", needCrew: 4, details: "Pedestrian hit by speeding vehicle. First-aid, ambulance, and police coordination.", sector: "tilak-nagar" },
  { id: "M-TN-610", category: "ENGINEERING", title: "Subhash Nagar Storm Drain Upgrade", location: "Subhash Nagar · Main Drain", priority: "MED", needCrew: 3, details: "Installing new gratings on 800m storm drain. Road partial closure coordination.", sector: "tilak-nagar" },
  { id: "M-TN-611", category: "LOGISTICS",   title: "Tilak Nagar-Rajouri Link Bus Route", location: "DTC Bus Stand · TN",       priority: "LOW",  needCrew: 2, details: "New bus route trial. Passenger feedback collection at 5 stops.", sector: "tilak-nagar" },
];

export const PROPOSALS = [
  { id: "P-001", title: "Cycle Track on Sector 12 Loop",      body: "Convert outer service lane into a 2.4 km cycle track with planters as separators." },
  { id: "P-002", title: "Free Evening Yoga at Sector 11",     body: "Tuesday and Thursday at 6 PM. Council to provide mats." },
  { id: "P-003", title: "Stray Dog Sterilisation Drive",      body: "Two-week drive across Sectors 1-7 with two MCD partner clinics." },
  { id: "P-004", title: "Sector 23 Wet-Waste Composting",     body: "Install 4 community compost bins; train 30 households." },
];

export const RECORDS = [
  // Dwarka — 12 records
  { id: "R-2401", title: "Dwarka Sub-City Master Plan 2041",    tag: "URBAN",    year: 2024, sector: "dwarka" },
  { id: "R-2402", title: "Sector 8 AQI Annual Report",          tag: "ENVIRO",   year: 2024, sector: "dwarka" },
  { id: "R-2389", title: "Bijwasan Toll Traffic Survey",        tag: "TRAFFIC",  year: 2024, sector: "dwarka" },
  { id: "R-2356", title: "RWA Federation Charter (1-23)",       tag: "CIVIC",    year: 2023, sector: "dwarka" },
  { id: "R-2298", title: "Monsoon Waterlogging Map",            tag: "ENVIRO",   year: 2023, sector: "dwarka" },
  { id: "R-2241", title: "Metro Phase IV Alignment Notes",      tag: "TRANSIT",  year: 2022, sector: "dwarka" },
  { id: "R-2403", title: "Sector 12 Market Renovation Blueprint", tag: "URBAN",  year: 2024, sector: "dwarka" },
  { id: "R-2404", title: "Dwarka Expressway Noise Pollution Study", tag: "ENVIRO", year: 2024, sector: "dwarka" },
  { id: "R-2405", title: "Sector 21 DMRC Ridership Data",       tag: "TRANSIT",  year: 2024, sector: "dwarka" },
  { id: "R-2406", title: "Sector 7 Dengue Hotspot Mapping",     tag: "MEDICAL",  year: 2023, sector: "dwarka" },
  { id: "R-2407", title: "BSES Dwarka Load Shedding Schedule",  tag: "POWER",    year: 2024, sector: "dwarka" },
  { id: "R-2408", title: "Sector 14 School Zone Safety Audit",  tag: "SECURITY", year: 2024, sector: "dwarka" },

  // Janakpuri — 11 records
  { id: "R-3101", title: "Janakpuri District Centre Plan",      tag: "URBAN",    year: 2024, sector: "janakpuri" },
  { id: "R-3102", title: "Pankha Road Traffic Analysis",        tag: "TRAFFIC",  year: 2024, sector: "janakpuri" },
  { id: "R-3103", title: "A-Block Crime Statistics Q1-Q3",      tag: "SECURITY", year: 2024, sector: "janakpuri" },
  { id: "R-3104", title: "C-Block Park Biodiversity Survey",    tag: "ENVIRO",   year: 2023, sector: "janakpuri" },
  { id: "R-3105", title: "Janakpuri West Metro Usage Report",   tag: "TRANSIT",  year: 2024, sector: "janakpuri" },
  { id: "R-3106", title: "B-Block Drainage Capacity Assessment", tag: "ENVIRO",  year: 2024, sector: "janakpuri" },
  { id: "R-3107", title: "District Centre Fire Safety Compliance", tag: "SECURITY", year: 2023, sector: "janakpuri" },
  { id: "R-3108", title: "E-Block Power Distribution Map",      tag: "POWER",    year: 2024, sector: "janakpuri" },
  { id: "R-3109", title: "D-Block Senior Citizen Census",       tag: "CIVIC",    year: 2023, sector: "janakpuri" },
  { id: "R-3110", title: "Pankha Road Flyover Structural Report", tag: "URBAN",  year: 2024, sector: "janakpuri" },
  { id: "R-3111", title: "Janakpuri Blood Bank Inventory Log",  tag: "MEDICAL",  year: 2024, sector: "janakpuri" },

  // Vikaspuri — 11 records
  { id: "R-3201", title: "Vikaspuri Block A Drainage Report",   tag: "ENVIRO",   year: 2024, sector: "vikaspuri" },
  { id: "R-3202", title: "Mohan Garden Safety Audit",           tag: "SECURITY", year: 2023, sector: "vikaspuri" },
  { id: "R-3203", title: "Vikaspuri Lake Water Quality Test",   tag: "ENVIRO",   year: 2024, sector: "vikaspuri" },
  { id: "R-3204", title: "Block C Road Condition Survey",       tag: "URBAN",    year: 2024, sector: "vikaspuri" },
  { id: "R-3205", title: "Uttam Nagar Metro Footfall Data",     tag: "TRANSIT",  year: 2024, sector: "vikaspuri" },
  { id: "R-3206", title: "Block D Vaccination Coverage Report", tag: "MEDICAL",  year: 2023, sector: "vikaspuri" },
  { id: "R-3207", title: "KK Tower Fire Escape Audit",          tag: "SECURITY", year: 2024, sector: "vikaspuri" },
  { id: "R-3208", title: "Vikaspuri-Janakpuri Bridge Load Test", tag: "URBAN",   year: 2024, sector: "vikaspuri" },
  { id: "R-3209", title: "Block E Stray Animal Census",         tag: "CIVIC",    year: 2023, sector: "vikaspuri" },
  { id: "R-3210", title: "Outer Ring Road Noise Map",           tag: "ENVIRO",   year: 2024, sector: "vikaspuri" },
  { id: "R-3211", title: "Block F Flood Risk Assessment",       tag: "ENVIRO",   year: 2024, sector: "vikaspuri" },

  // Rajouri Garden — 11 records
  { id: "R-3301", title: "Rajouri Garden Metro Connectivity",   tag: "TRANSIT",  year: 2024, sector: "rajouri-garden" },
  { id: "R-3302", title: "Mayapuri Industrial Emissions",       tag: "ENVIRO",   year: 2023, sector: "rajouri-garden" },
  { id: "R-3303", title: "TDI Mall Parking Capacity Study",     tag: "TRAFFIC",  year: 2024, sector: "rajouri-garden" },
  { id: "R-3304", title: "J-Block Population Density Report",   tag: "CIVIC",    year: 2024, sector: "rajouri-garden" },
  { id: "R-3305", title: "Najafgarh Road Pothole Inventory",    tag: "URBAN",    year: 2024, sector: "rajouri-garden" },
  { id: "R-3306", title: "Tagore Garden Extension RWA Minutes", tag: "CIVIC",    year: 2023, sector: "rajouri-garden" },
  { id: "R-3307", title: "Mayapuri Phase II Fire Risk Map",     tag: "SECURITY", year: 2024, sector: "rajouri-garden" },
  { id: "R-3308", title: "Ring Road Moti Nagar Accident Stats", tag: "TRAFFIC",  year: 2024, sector: "rajouri-garden" },
  { id: "R-3309", title: "H-Block Water Supply Schedule",       tag: "CIVIC",    year: 2024, sector: "rajouri-garden" },
  { id: "R-3310", title: "Rajouri Metro Feeder Bus Analysis",   tag: "TRANSIT",  year: 2024, sector: "rajouri-garden" },
  { id: "R-3311", title: "Rajouri Garden AQI Quarterly Report", tag: "ENVIRO",   year: 2024, sector: "rajouri-garden" },

  // Punjabi Bagh — 11 records
  { id: "R-3401", title: "Punjabi Bagh Flood Risk Map",         tag: "ENVIRO",   year: 2024, sector: "punjabi-bagh" },
  { id: "R-3402", title: "Club Road Traffic Flow Analysis",     tag: "TRAFFIC",  year: 2024, sector: "punjabi-bagh" },
  { id: "R-3403", title: "East PB Dengue Incidence Report",     tag: "MEDICAL",  year: 2023, sector: "punjabi-bagh" },
  { id: "R-3404", title: "Madipur Industrial Safety Audit",     tag: "SECURITY", year: 2024, sector: "punjabi-bagh" },
  { id: "R-3405", title: "Ring Road Flyover Structural Survey", tag: "URBAN",    year: 2024, sector: "punjabi-bagh" },
  { id: "R-3406", title: "Shivaji Park Greenery Assessment",   tag: "ENVIRO",   year: 2023, sector: "punjabi-bagh" },
  { id: "R-3407", title: "PB Lake Water Quality Report",       tag: "ENVIRO",   year: 2024, sector: "punjabi-bagh" },
  { id: "R-3408", title: "West PB Market Vendor Census",       tag: "CIVIC",    year: 2024, sector: "punjabi-bagh" },
  { id: "R-3409", title: "ESI Hospital Capacity Report",       tag: "MEDICAL",  year: 2024, sector: "punjabi-bagh" },
  { id: "R-3410", title: "Saraswati Vihar Crime Map Q2",       tag: "SECURITY", year: 2024, sector: "punjabi-bagh" },
  { id: "R-3411", title: "Punjabi Bagh Metro Ridership Trends", tag: "TRANSIT", year: 2024, sector: "punjabi-bagh" },

  // Tilak Nagar — 11 records
  { id: "R-3501", title: "Tilak Nagar Market Survey",           tag: "CIVIC",    year: 2024, sector: "tilak-nagar" },
  { id: "R-3502", title: "Kirti Nagar Industrial Fire Log",     tag: "SECURITY", year: 2024, sector: "tilak-nagar" },
  { id: "R-3503", title: "Subhash Nagar Metro Crowd Study",     tag: "TRANSIT",  year: 2024, sector: "tilak-nagar" },
  { id: "R-3504", title: "Tilak Nagar Flyover Inspection",      tag: "URBAN",    year: 2024, sector: "tilak-nagar" },
  { id: "R-3505", title: "Moti Nagar Road Accident Analysis",   tag: "TRAFFIC",  year: 2024, sector: "tilak-nagar" },
  { id: "R-3506", title: "Kirti Nagar Furniture Market Census", tag: "CIVIC",    year: 2023, sector: "tilak-nagar" },
  { id: "R-3507", title: "Subhash Nagar Storm Drain Capacity",  tag: "ENVIRO",   year: 2024, sector: "tilak-nagar" },
  { id: "R-3508", title: "Tilak Nagar AQI Monitoring Report",   tag: "ENVIRO",   year: 2024, sector: "tilak-nagar" },
  { id: "R-3509", title: "Moti Nagar Community Garden Plan",    tag: "CIVIC",    year: 2024, sector: "tilak-nagar" },
  { id: "R-3510", title: "TN-Rajouri Bus Route Usage Data",     tag: "TRANSIT",  year: 2024, sector: "tilak-nagar" },
  { id: "R-3511", title: "Kirti Nagar ITPO Event Schedule",     tag: "CIVIC",    year: 2024, sector: "tilak-nagar" },
];

export const TOOL_KIT = [
  { id: "tk-01", name: "First-Aid Kit · 10-pack" },
  { id: "tk-02", name: "Hi-Vis Vests · 24" },
  { id: "tk-03", name: "Walkie-Talkie Set · 6" },
  { id: "tk-04", name: "Folding Cones · 30" },
  { id: "tk-05", name: "Cordless Drill" },
  { id: "tk-06", name: "Power Bank · 20kAh" },
  { id: "tk-07", name: "N95 Masks · 50" },
  { id: "tk-08", name: "Stretcher · folding" },
];

export type Tool = { id: string; label: string; group: string };
export const TOOLS: Tool[] = [
  { id: "calc",      label: "Calculator",        group: "Personal" },
  { id: "notes",     label: "My Notes",          group: "Personal" },
  { id: "timer",     label: "Focus Timer",       group: "Personal" },
  { id: "hydration", label: "Hydration Alarm",   group: "Personal" },
  { id: "signer",    label: "Document Signer",   group: "Public Office" },
  { id: "report",    label: "Report a Problem",  group: "Public Office" },
  { id: "petition",  label: "Sign a Petition",   group: "Public Office" },
  { id: "lostfound", label: "Lost and Found",    group: "Community" },
  { id: "carpool",   label: "Find a Carpool",    group: "Community" },
  { id: "blood",     label: "Blood Donor Board", group: "Community" },
  { id: "events",    label: "Local Events",      group: "Community" },
  { id: "weather",   label: "Weather Telemetry", group: "Station Utilities" },
  { id: "aqi",       label: "Air Quality Now",   group: "Station Utilities" },
  { id: "traffic",   label: "Traffic Snapshot",  group: "Station Utilities" },
  { id: "power",     label: "Power Grid Status", group: "Station Utilities" },
  { id: "police",    label: "Police: 100",            group: "Help" },
  { id: "fire",      label: "Fire: 101",              group: "Help" },
  { id: "ambulance", label: "Ambulance: 102",         group: "Help" },
  { id: "women",     label: "Women Helpline: 1091",   group: "Help" },
  { id: "child",     label: "Child Helpline: 1098",   group: "Help" },
  { id: "cyber",     label: "Cyber Crime: 1930",      group: "Help" },
];

// Sector-specific broadcast queues for the live broadcast engine
export type SectorBroadcast = { text: string; priority: "HIGH" | "MED" | "LOW" };

export const SECTOR_BROADCASTS: Record<string, SectorBroadcast[]> = {
  dwarka: [
    { text: "Sector 21 Metro: Escalator maintenance — use stairs at Gate 2", priority: "MED" },
    { text: "Bijwasan Toll: All lanes clear. Avg wait 4 min", priority: "LOW" },
    { text: "Sector 12 Market: Heavy foot traffic. Marshals deployed", priority: "HIGH" },
    { text: "Sector 9 Hospital: OPD wait time 45 min", priority: "MED" },
    { text: "Dwarka Expressway: Construction zone speed limit 40 kmph", priority: "MED" },
    { text: "Sector 6 Archives: Document pickup open till 17:00", priority: "LOW" },
    { text: "Sector 10: Water tanker ETA 14:30 — Pocket A first", priority: "MED" },
    { text: "Sector 14 DPS: School zone speed cameras active", priority: "LOW" },
    { text: "Sector 3 Community Hall: RWA meeting postponed to Saturday", priority: "LOW" },
    { text: "BSES Dwarka: Scheduled maintenance Sector 7 — 22:00-02:00", priority: "HIGH" },
  ],
  janakpuri: [
    { text: "Pankha Road: Market congestion level HIGH. Use D-Block bypass", priority: "HIGH" },
    { text: "District Centre: Parking 85% full. Use metro P+R lot", priority: "MED" },
    { text: "Janakpuri West Metro: Platform 2 crowded, use Gate C", priority: "MED" },
    { text: "A-Block SBI ATM: Back online after maintenance", priority: "LOW" },
    { text: "B-Block: Sewer repair underway — Lane 2 closed", priority: "HIGH" },
    { text: "C-Block Park: Evening yoga session at 18:00", priority: "LOW" },
    { text: "E-Block: Transformer replacement complete. Power restored", priority: "MED" },
    { text: "D-Block: Senior citizen health camp tomorrow 09:00-13:00", priority: "LOW" },
    { text: "Pankha Road Flyover: Speed limit enforcement active", priority: "MED" },
    { text: "DTC Route 522: 12 min delay due to depot sync", priority: "MED" },
  ],
  vikaspuri: [
    { text: "Block A: Sewer repair in progress — avoid Vikas Marg detour", priority: "HIGH" },
    { text: "Mohan Garden: Night patrol active 22:00-05:00", priority: "MED" },
    { text: "Vikaspuri Lake: Cleanup crew on site. No fishing today", priority: "LOW" },
    { text: "KK Tower: All lifts operational. Maintenance complete", priority: "LOW" },
    { text: "Block C: Road resurfacing — single lane traffic", priority: "HIGH" },
    { text: "Uttam Nagar Metro: Parking enforcement — tow active", priority: "MED" },
    { text: "Block D: Vaccination camp at community centre 10:00-16:00", priority: "MED" },
    { text: "Block E: Stray dog sterilization drive this week", priority: "LOW" },
    { text: "Block F: Pump deployment for waterlogging — drain clearing", priority: "MED" },
    { text: "Outer Ring Road: Heavy vehicle restriction 07:00-22:00", priority: "MED" },
  ],
  "rajouri-garden": [
    { text: "Rajouri Metro: Pickpocket alert — secure belongings", priority: "HIGH" },
    { text: "TDI Mall: Parking overflow. Use Tagore Garden lot", priority: "MED" },
    { text: "Mayapuri Industrial: MCD cleanup trucks on site", priority: "LOW" },
    { text: "Najafgarh Road: Pothole repair — single lane near Tagore Garden", priority: "HIGH" },
    { text: "J-Block: Free eye camp tomorrow at Gurudwara Hall", priority: "LOW" },
    { text: "Ring Road Moti Nagar: Accident site cleared. Normal flow", priority: "MED" },
    { text: "Main Market: Fire safety inspection underway — Block A", priority: "MED" },
    { text: "Tagore Garden Ext: RWA meeting at park — 18:30", priority: "LOW" },
    { text: "Mayapuri Phase II: Industrial patrol 21:00-04:00", priority: "MED" },
    { text: "H-Block: Water main repair complete. Supply resumed", priority: "MED" },
  ],
  "punjabi-bagh": [
    { text: "Club Road: Heavy traffic — festival market active", priority: "HIGH" },
    { text: "Rohtak Road Madipur: Accident site cleared. Normal flow", priority: "MED" },
    { text: "Ring Road Flyover: Mural painting — lane closure till 16:00", priority: "MED" },
    { text: "ESI Hospital: OPD queue 30 min. Use counter 4", priority: "MED" },
    { text: "Saraswati Vihar: ATM patrol active 20:00-06:00", priority: "MED" },
    { text: "East PB: Dengue survey team in Blocks 20-25", priority: "LOW" },
    { text: "PB Lake: Restoration committee meeting at North Gate 17:00", priority: "LOW" },
    { text: "Madipur Industrial: Gas monitoring — all clear", priority: "LOW" },
    { text: "Shivaji Park: Inter-colony sports day setup in progress", priority: "LOW" },
    { text: "West PB Market: Weekend rush expected — extra marshals", priority: "HIGH" },
  ],
  "tilak-nagar": [
    { text: "Subhash Nagar Metro: Peak hour advisory — use Gate A", priority: "HIGH" },
    { text: "Tilak Nagar Market: Chain snatching alert — stay vigilant", priority: "HIGH" },
    { text: "Kirti Nagar Industrial: Fire safety audit ongoing", priority: "MED" },
    { text: "Tilak Nagar Flyover: Night repair work 23:00-05:00", priority: "MED" },
    { text: "Moti Nagar: Community garden volunteers needed Sunday 07:00", priority: "LOW" },
    { text: "Subhash Nagar Clinic: Flu season — expect longer waits", priority: "MED" },
    { text: "Kirti Nagar ITPO: Trade fair next week — parking plan issued", priority: "LOW" },
    { text: "DTC: New Route TN-RG trial this month. Feedback welcome", priority: "LOW" },
    { text: "Subhash Nagar: Storm drain upgrade — partial road closure", priority: "MED" },
    { text: "Najafgarh Road Moti Nagar: Speed cameras activated", priority: "MED" },
  ],
};
