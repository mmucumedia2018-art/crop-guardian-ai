export interface Disease {
  id: string;
  name: string;
  crop: string;
  confidence: "High" | "Moderate" | "Low";
  severity: "Severe" | "Moderate" | "Mild";
  description: string;
  treatment: string[];
  prevention: string[];
}

export interface ScanRecord {
  id: string;
  date: string;
  imageUrl: string;
  crop: string;
  disease: Disease | null;
  isHealthy: boolean;
}

export const MOCK_DISEASES: Disease[] = [
  {
    id: "1",
    name: "Late Blight",
    crop: "Tomato",
    confidence: "High",
    severity: "Severe",
    description:
      "Late blight is caused by the fungus-like organism Phytophthora infestans. It spreads rapidly in cool, wet conditions and can destroy entire fields within days.",
    treatment: [
      "Remove and destroy all infected plant parts immediately",
      "Apply copper-based fungicide (e.g., Bordeaux mixture) every 7–10 days",
      "Ensure good air circulation by spacing plants properly",
      "Avoid overhead watering — use drip irrigation instead",
    ],
    prevention: [
      "Use certified disease-free seeds or seedlings",
      "Rotate crops — do not plant tomatoes in the same spot for 2 years",
      "Plant resistant varieties when available",
    ],
  },
  {
    id: "2",
    name: "Bacterial Leaf Blight",
    crop: "Rice",
    confidence: "High",
    severity: "Moderate",
    description:
      "Caused by Xanthomonas oryzae, this disease creates water-soaked lesions that turn yellow and then white as they dry out.",
    treatment: [
      "Drain the field to reduce humidity around plants",
      "Apply streptomycin-based bactericide if available",
      "Remove heavily infected plants from the field",
      "Reduce nitrogen fertilizer application",
    ],
    prevention: [
      "Use resistant rice varieties (e.g., IR64, IRBB21)",
      "Treat seeds with hot water (53°C for 10 minutes) before planting",
      "Avoid excessive nitrogen fertilization",
    ],
  },
  {
    id: "3",
    name: "Maize Streak Virus",
    crop: "Maize",
    confidence: "Moderate",
    severity: "Severe",
    description:
      "Transmitted by leafhoppers, this virus causes yellow streaks along leaf veins and stunted growth. No chemical cure exists.",
    treatment: [
      "Remove and burn all infected plants promptly",
      "Control leafhopper vectors with approved insecticides",
      "Plant early in the season to avoid peak leafhopper populations",
      "Intercrop with non-host plants to disrupt vector movement",
    ],
    prevention: [
      "Use resistant maize varieties",
      "Control weeds that harbour leafhoppers",
      "Synchronize planting dates with neighbouring farmers",
    ],
  },
];

export const MOCK_HISTORY: ScanRecord[] = [
  {
    id: "h1",
    date: "2026-03-15",
    imageUrl: "",
    crop: "Tomato",
    disease: MOCK_DISEASES[0],
    isHealthy: false,
  },
  {
    id: "h2",
    date: "2026-03-14",
    imageUrl: "",
    crop: "Maize",
    disease: null,
    isHealthy: true,
  },
  {
    id: "h3",
    date: "2026-03-12",
    imageUrl: "",
    crop: "Rice",
    disease: MOCK_DISEASES[1],
    isHealthy: false,
  },
];
