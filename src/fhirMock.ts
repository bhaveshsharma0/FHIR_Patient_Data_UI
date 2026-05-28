export interface PatientProfile {
  id: string;
  name: {
    given: string[];
    family: string;
    text: string;
  };
  dob: string;
  gender: string;
  race: string;
  ethnicity: string;
  address: {
    line: string[];
    city: string;
    state: string;
    postalCode: string;
  };
  phone: string;
  email: string;
  pcp: string;
  maritalStatus: string;
  language: string;
  lastUpdated: string;
  healthScore: number;
  insurance: {
    payerName: string;
    planName: string;
    planType: string;
    memberId: string;
    groupNumber: string;
    startDate: string;
    endDate: string;
    copay: number;
    deductible: number;
    deductibleMet: number;
    oopMax: number;
    oopMet: number;
    status: 'Active' | 'Inactive' | 'Expired';
    priority: 'Primary' | 'Secondary';
  };
  conditions: Array<{
    name: string;
    icd10: string;
    status: string;
    onset: string;
    severity: 'Severe' | 'Moderate' | 'Mild';
  }>;
  medications: Array<{
    name: string;
    dosage: string;
    frequency: string;
    prescriber: string;
    startDate: string;
    status: string;
    interactionRisk?: string; // red flag
  }>;
  allergies: Array<{
    allergen: string;
    reaction: string;
    severity: 'Severe' | 'Moderate' | 'Mild';
    recordedDate: string;
  }>;
  observations: Array<{
    name: string;
    value: string;
    unit: string;
    normalRange: string;
    date: string;
    flag: 'Normal' | 'High' | 'Low';
    trend: 'up' | 'down' | 'stable';
  }>;
  encounters: Array<{
    date: string;
    type: 'Inpatient' | 'Outpatient' | 'Emergency';
    reason: string;
    provider: string;
    duration: string;
  }>;
  claims: Array<{
    id: string;
    date: string;
    provider: string;
    code: string;
    billed: number;
    paid: number;
    patientResponsibility: number;
    status: 'Paid' | 'Denied' | 'Pending' | 'In Review';
  }>;
}

export const mockPatients: Record<string, PatientProfile> = {
  "592619": {
    id: "592619",
    name: {
      given: ["John", "Edward"],
      family: "Smith",
      text: "John Edward Smith"
    },
    dob: "1962-03-12",
    gender: "male",
    race: "White or Caucasian",
    ethnicity: "Non-Hispanic or Latino",
    address: {
      line: ["124 Medical Plaza"],
      city: "Boston",
      state: "MA",
      postalCode: "02115"
    },
    phone: "617-555-0199",
    email: "john.smith@email.com",
    pcp: "Dr. Sarah Vance, MD",
    maritalStatus: "Married",
    language: "English",
    lastUpdated: "2026-05-15",
    healthScore: 78,
    insurance: {
      payerName: "Blue Cross Blue Shield",
      planName: "Shield PPO Silver",
      planType: "PPO",
      memberId: "BCBS99218274",
      groupNumber: "G-88912",
      startDate: "2026-01-01",
      endDate: "2026-12-31",
      copay: 30,
      deductible: 1500,
      deductibleMet: 1200,
      oopMax: 6500,
      oopMet: 3200,
      status: "Active",
      priority: "Primary"
    },
    conditions: [
      {
        name: "Type 2 Diabetes Mellitus with Diabetic Nephropathy",
        icd10: "E11.22",
        status: "Active",
        onset: "2018-05-10",
        severity: "Severe"
      },
      {
        name: "Essential Hypertension",
        icd10: "I10",
        status: "Active",
        onset: "2015-08-20",
        severity: "Moderate"
      },
      {
        name: "Hyperlipidemia",
        icd10: "E78.5",
        status: "Active",
        onset: "2016-11-04",
        severity: "Mild"
      }
    ],
    medications: [
      {
        name: "Metformin HCl 1000mg ER",
        dosage: "1000 mg",
        frequency: "Twice daily with meals",
        prescriber: "Dr. Sarah Vance, MD",
        startDate: "2018-05-12",
        status: "Active"
      },
      {
        name: "Lisinopril 20mg Tablet",
        dosage: "20 mg",
        frequency: "Once daily in the morning",
        prescriber: "Dr. Sarah Vance, MD",
        startDate: "2015-08-22",
        status: "Active",
        interactionRisk: "High risk of creatinine increase when combined with Empagliflozin in setting of mild dehydration. Monitor kidney function parameters."
      },
      {
        name: "Atorvastatin Calcium 40mg",
        dosage: "40 mg",
        frequency: "Once daily at bedtime",
        prescriber: "Dr. Sarah Vance, MD",
        startDate: "2016-11-06",
        status: "Active"
      },
      {
        name: "Empagliflozin 10mg",
        dosage: "10 mg",
        frequency: "Once daily",
        prescriber: "Dr. Sarah Vance, MD",
        startDate: "2021-04-15",
        status: "Active",
        interactionRisk: "Combined use with ACE-inhibitor (Lisinopril) requires renal monitoring."
      }
    ],
    allergies: [
      {
        allergen: "Sulfonamide Antibiotics (Sulfa Drugs)",
        reaction: "Severe maculopapular rash, generalized hives, and light pruritus",
        severity: "Moderate",
        recordedDate: "2013-04-12"
      },
      {
        allergen: "Iodinated Contrast Media",
        reaction: "Anaphylactoid bronchospasm and acute urticaria",
        severity: "Severe",
        recordedDate: "2019-10-22"
      }
    ],
    observations: [
      {
        name: "Hemoglobin A1c (HbA1c)",
        value: "8.4",
        unit: "%",
        normalRange: "< 5.7%",
        date: "2026-02-15",
        flag: "High",
        trend: "up"
      },
      {
        name: "Systolic Blood Pressure",
        value: "142",
        unit: "mmHg",
        normalRange: "90 - 120 mmHg",
        date: "2026-04-10",
        flag: "High",
        trend: "up"
      },
      {
        name: "Diastolic Blood Pressure",
        value: "92",
        unit: "mmHg",
        normalRange: "60 - 80 mmHg",
        date: "2026-04-10",
        flag: "High",
        trend: "up"
      },
      {
        name: "LDL Cholesterol",
        value: "112",
        unit: "mg/dL",
        normalRange: "< 100 mg/dL",
        date: "2026-02-15",
        flag: "High",
        trend: "up"
      },
      {
        name: "Estimated GFR (eGFR)",
        value: "54",
        unit: "mL/min/1.73m2",
        normalRange: "> 90 mL/min/1.73m2",
        date: "2026-02-15",
        flag: "Low",
        trend: "down"
      },
      {
        name: "Fasting Blood Glucose",
        value: "138",
        unit: "mg/dL",
        normalRange: "70 - 100 mg/dL",
        date: "2026-02-15",
        flag: "High",
        trend: "stable"
      }
    ],
    encounters: [
      {
        date: "2026-04-10",
        type: "Outpatient",
        reason: "6-Month Comprehensive Hypertension & Diabetes Wellness Review",
        provider: "Dr. Sarah Vance, MD",
        duration: "40 min"
      },
      {
        date: "2026-02-15",
        type: "Outpatient",
        reason: "Diabetic Nephropathy Monitoring & Lab Draw",
        provider: "Dr. Sarah Vance, MD",
        duration: "30 min"
      },
      {
        date: "2025-11-08",
        type: "Emergency",
        reason: "Hypertensive Crisis with associated severe occipital headache",
        provider: "Boston General Emergency Dept",
        duration: "4 hours"
      }
    ],
    claims: [
      {
        id: "CL-2026-8812",
        date: "2026-04-10",
        provider: "Dr. Sarah Vance, MD",
        code: "99214 (Outpatient Office Visit, Level 4)",
        billed: 240,
        paid: 180,
        patientResponsibility: 30,
        status: "Paid"
      },
      {
        id: "CL-2026-7741",
        date: "2026-02-15",
        provider: "Boston General Pathology Labs",
        code: "83036 (Glycated hemoglobin/HbA1c Lab Test)",
        billed: 85,
        paid: 65,
        patientResponsibility: 0,
        status: "Paid"
      },
      {
        id: "CL-2025-9921",
        date: "2025-11-08",
        provider: "Boston General Emergency Dept",
        code: "99284 (Emergency Dept Visit, High Severity)",
        billed: 1850,
        paid: 0,
        patientResponsibility: 1850,
        status: "Denied"
      }
    ]
  },
  "13681311": {
    id: "13681311",
    name: {
      given: ["Mary", "Jane"],
      family: "Johnson",
      text: "Mary Jane Johnson"
    },
    dob: "1968-07-22",
    gender: "female",
    race: "Black or African American",
    ethnicity: "Non-Hispanic or Latino",
    address: {
      line: ["742 Evergreen Terrace"],
      city: "Chicago",
      state: "IL",
      postalCode: "60611"
    },
    phone: "312-555-0145",
    email: "mary.johnson@email.com",
    pcp: "Dr. Michael Chen, MD",
    maritalStatus: "Single",
    language: "English",
    lastUpdated: "2026-05-10",
    healthScore: 65,
    insurance: {
      payerName: "Aetna Life Insurance",
      planName: "Aetna Choice POS II",
      planType: "POS",
      memberId: "AET-5542190",
      groupNumber: "AE-9941",
      startDate: "2026-01-01",
      endDate: "2026-12-31",
      copay: 25,
      deductible: 1000,
      deductibleMet: 450,
      oopMax: 5000,
      oopMet: 1100,
      status: "Active",
      priority: "Primary"
    },
    conditions: [
      {
        name: "Moderate Persistent Asthma",
        icd10: "J45.40",
        status: "Active",
        onset: "2012-04-12",
        severity: "Moderate"
      },
      {
        name: "Obesity Class 1",
        icd10: "E66.9",
        status: "Active",
        onset: "2020-01-15",
        severity: "Moderate"
      },
      {
        name: "Gastroesophageal Reflux Disease (GERD)",
        icd10: "K21.9",
        status: "Active",
        onset: "2022-09-10",
        severity: "Mild"
      }
    ],
    medications: [
      {
        name: "Albuterol 90mcg Inhaler",
        dosage: "90 mcg",
        frequency: "2 puffs every 4 hours as needed for shortness of breath",
        prescriber: "Dr. Michael Chen, MD",
        startDate: "2012-04-14",
        status: "Active"
      },
      {
        name: "Omeprazole 20mg Delayed Release",
        dosage: "20 mg",
        frequency: "Once daily before breakfast",
        prescriber: "Dr. Michael Chen, MD",
        startDate: "2022-09-12",
        status: "Active"
      },
      {
        name: "Advair Diskus 250/50 mcg",
        dosage: "1 inhalation",
        frequency: "Twice daily",
        prescriber: "Dr. Michael Chen, MD",
        startDate: "2018-09-15",
        status: "Active"
      }
    ],
    allergies: [
      {
        allergen: "Penicillin G",
        reaction: "Angioedema, widespread hives, and severe pruritus",
        severity: "Severe",
        recordedDate: "1995-05-18"
      }
    ],
    observations: [
      {
        name: "Systolic Blood Pressure",
        value: "118",
        unit: "mmHg",
        normalRange: "90 - 120 mmHg",
        date: "2026-05-01",
        flag: "Normal",
        trend: "stable"
      },
      {
        name: "Diastolic Blood Pressure",
        value: "76",
        unit: "mmHg",
        normalRange: "60 - 80 mmHg",
        date: "2026-05-01",
        flag: "Normal",
        trend: "stable"
      },
      {
        name: "Body Mass Index (BMI)",
        value: "32.4",
        unit: "kg/m2",
        normalRange: "18.5 - 24.9 kg/m2",
        date: "2026-05-01",
        flag: "High",
        trend: "up"
      },
      {
        name: "FEV1/FVC Ratio (Spirometry)",
        value: "72",
        unit: "%",
        normalRange: "> 75%",
        date: "2025-08-14",
        flag: "Low",
        trend: "down"
      }
    ],
    encounters: [
      {
        date: "2026-05-01",
        type: "Outpatient",
        reason: "Asthma Controller Therapy Adherence Check & Spirometry Review",
        provider: "Dr. Michael Chen, MD",
        duration: "25 min"
      },
      {
        date: "2025-08-14",
        type: "Outpatient",
        reason: "Annual Clinical Physical, BMI Monitoring & Preventative Screenings Consultation",
        provider: "Dr. Michael Chen, MD",
        duration: "40 min"
      }
    ],
    claims: [
      {
        id: "CL-2026-4412",
        date: "2026-05-01",
        provider: "Dr. Michael Chen, MD",
        code: "99213 (Outpatient Visit, Level 3)",
        billed: 180,
        paid: 140,
        patientResponsibility: 25,
        status: "Paid"
      },
      {
        id: "CL-2025-1829",
        date: "2025-08-14",
        provider: "Dr. Michael Chen, MD",
        code: "99396 (Preventive Counseling and Exam)",
        billed: 280,
        paid: 280,
        patientResponsibility: 0,
        status: "Paid"
      },
      {
        id: "CL-2026-0112",
        date: "2026-02-12",
        provider: "Walgreens Pharmacy Hub",
        code: "92415 (Walgreens Omeprazole Extended Pack)",
        billed: 45,
        paid: 0,
        patientResponsibility: 0,
        status: "Pending"
      }
    ]
  }
};
