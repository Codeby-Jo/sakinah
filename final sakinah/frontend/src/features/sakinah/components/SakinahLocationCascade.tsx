import React from 'react';
import { SakinahSearchableSelect } from './SakinahSearchableSelect';

export interface LocationData {
  country: string;
  state: string;
  district: string;
  city: string;
}

interface SakinahLocationCascadeProps {
  value: LocationData;
  onChange: (loc: LocationData) => void;
  errors?: Partial<Record<keyof LocationData, string>>;
}

// Mock data
const mockDB = {
  India: {
    'Tamil Nadu': {
      'Chennai': ['Adyar', 'T Nagar', 'Velachery', 'Tambaram'],
      'Coimbatore': ['Peelamedu', 'Gandhipuram', 'RS Puram'],
      'Madurai': ['Anna Nagar', 'KK Nagar'],
    },
    'Kerala': {
      'Ernakulam': ['Kochi', 'Aluva', 'Kakkanad'],
      'Trivandrum': ['Kazhakootam', 'Pattom'],
    },
    'Maharashtra': {
      'Mumbai Suburban': ['Andheri', 'Bandra', 'Borivali'],
      'Pune': ['Hinjewadi', 'Kothrud'],
    }
  },
  'United Arab Emirates': {
    'Dubai': {
      'Dubai': ['Deira', 'Bur Dubai', 'Downtown', 'Marina'],
    },
    'Abu Dhabi': {
      'Abu Dhabi': ['Khalidiya', 'Reem Island'],
    }
  },
  'United Kingdom': {
    'England': {
      'Greater London': ['Westminster', 'Camden', 'Greenwich'],
      'West Midlands': ['Birmingham', 'Coventry'],
    }
  }
};

export const SakinahLocationCascade: React.FC<SakinahLocationCascadeProps> = ({
  value, onChange, errors = {}
}) => {
  const update = (field: keyof LocationData, val: string) => {
    const next = { ...value, [field]: val };
    if (field === 'country') { next.state = ''; next.district = ''; next.city = ''; }
    if (field === 'state') { next.district = ''; next.city = ''; }
    if (field === 'district') { next.city = ''; }
    onChange(next);
  };

  const countries = Object.keys(mockDB).map(c => ({ value: c, label: c }));
  
  let states: { value: string; label: string }[] = [];
  if (value.country && mockDB[value.country as keyof typeof mockDB]) {
    states = Object.keys(mockDB[value.country as keyof typeof mockDB]).map(s => ({ value: s, label: s }));
  }

  let districts: { value: string; label: string }[] = [];
  if (value.state && states.length > 0) {
    const stateData = (mockDB as any)[value.country]?.[value.state];
    if (stateData) {
      districts = Object.keys(stateData).map(d => ({ value: d, label: d }));
    }
  }

  let cities: { value: string; label: string }[] = [];
  if (value.district && districts.length > 0) {
    const cityData = (mockDB as any)[value.country]?.[value.state]?.[value.district];
    if (cityData) {
      cities = cityData.map((c: string) => ({ value: c, label: c }));
    }
  }

  return (
    <div className="space-y-4">
      <SakinahSearchableSelect 
        label="Country" 
        value={value.country} 
        onChange={v => update('country', v)} 
        options={countries} 
        error={errors.country} 
        required 
        allowOther 
      />
      <SakinahSearchableSelect 
        label="State / Province" 
        value={value.state} 
        onChange={v => update('state', v)} 
        options={states} 
        error={errors.state} 
        required 
        allowOther 
      />
      <div className="flex gap-4">
        <div className="flex-1">
          <SakinahSearchableSelect 
            label="District / County" 
            value={value.district} 
            onChange={v => update('district', v)} 
            options={districts} 
            error={errors.district} 
            allowOther 
          />
        </div>
        <div className="flex-1">
          <SakinahSearchableSelect 
            label="City / Town" 
            value={value.city} 
            onChange={v => update('city', v)} 
            options={cities} 
            error={errors.city} 
            required 
            allowOther 
          />
        </div>
      </div>
    </div>
  );
};
