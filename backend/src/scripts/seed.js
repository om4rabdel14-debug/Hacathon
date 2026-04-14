/**
 * Seed script: populates the database with sample reports for demo purposes.
 * Run with: npm run seed (from backend directory)
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const SAMPLE_REPORTS = [
  {
    description: 'Overflowing garbage bin near the main school entrance. Waste is spilling onto the sidewalk.',
    lat: 31.5326,
    lng: 35.0998,
    address: 'Main Street, near Al-Khalil School',
    citizen_name: 'Ahmad Hassan',
    issue_type: 'overflowing_bin',
    severity: 'high',
    confidence: 0.95,
    ai_summary: 'Overflowing waste container near a school entrance. Waste is spilling onto the pedestrian walkway, posing a public health risk for students and passersby.',
    severity_explanation: 'High severity due to proximity to a school and waste spilling onto public walkway, creating health and safety hazards.',
    recommended_department: 'Sanitation',
    priority_score: 8,
    priority_level: 'high',
    status: 'assigned',
    assigned_department: 'Sanitation',
    image_url: 'https://placehold.co/600x400/e2e8f0/475569?text=Overflowing+Bin',
  },
  {
    description: 'كمية كبيرة من النفايات مرمية بشكل عشوائي بجانب الطريق الرئيسي',
    lat: 31.5290,
    lng: 35.0950,
    address: 'Industrial Zone Road',
    citizen_name: 'Mohammed Ali',
    issue_type: 'illegal_dumping',
    severity: 'critical',
    confidence: 0.92,
    ai_summary: 'Large-scale illegal dumping detected along the main road in the industrial zone. Multiple bags and loose waste covering a significant area.',
    severity_explanation: 'Critical severity: large volume of illegally dumped waste along a main road, potential environmental contamination and public health risk.',
    recommended_department: 'Field Operations',
    priority_score: 9,
    priority_level: 'urgent',
    status: 'in_progress',
    assigned_department: 'Field Operations',
    image_url: 'https://placehold.co/600x400/fef2f2/991b1b?text=Illegal+Dumping',
  },
  {
    description: 'Construction debris and rubble left on the side of the road after building renovation.',
    lat: 31.5350,
    lng: 35.1020,
    address: 'Al-Salam Street, Block 5',
    citizen_name: 'Fatima Khalil',
    issue_type: 'construction_debris',
    severity: 'medium',
    confidence: 0.88,
    ai_summary: 'Construction debris including concrete blocks, rubble, and building materials left on the roadside after a renovation project.',
    severity_explanation: 'Medium severity: construction waste is localized and not blocking the main road, but requires cleanup to prevent accumulation.',
    recommended_department: 'Field Operations',
    priority_score: 5,
    priority_level: 'medium',
    status: 'assigned',
    assigned_department: 'Field Operations',
    image_url: 'https://placehold.co/600x400/fef9c3/854d0e?text=Construction+Debris',
  },
  {
    description: 'الحاوية مكسورة والغطاء مفتوح دائماً والقطط تنشر الزبالة',
    lat: 31.5310,
    lng: 35.0970,
    address: 'Al-Hussein Street',
    citizen_name: 'Sara Yousef',
    issue_type: 'broken_container',
    severity: 'medium',
    confidence: 0.90,
    ai_summary: 'Broken waste container with a permanently open lid. Animals are scattering waste from the container onto the surrounding area.',
    severity_explanation: 'Medium severity: broken container causing ongoing waste dispersal by animals, needs repair or replacement.',
    recommended_department: 'Container Maintenance',
    priority_score: 5,
    priority_level: 'medium',
    status: 'resolved',
    assigned_department: 'Container Maintenance',
    image_url: 'https://placehold.co/600x400/dbeafe/1e40af?text=Broken+Container',
  },
  {
    description: 'Someone is burning waste in an empty lot behind the residential area. Heavy smoke.',
    lat: 31.5280,
    lng: 35.1040,
    address: 'Behind Al-Noor Residential Complex',
    citizen_name: 'Khaled Nasser',
    issue_type: 'burning_waste',
    severity: 'critical',
    confidence: 0.97,
    ai_summary: 'Active waste burning in an empty lot adjacent to a residential area. Heavy smoke reported, posing immediate air quality and fire hazard risks.',
    severity_explanation: 'Critical severity: active burning near residential area creates immediate health hazard from toxic smoke and fire risk.',
    recommended_department: 'Emergency / Environment',
    priority_score: 10,
    priority_level: 'urgent',
    status: 'resolved',
    assigned_department: 'Emergency / Environment',
    image_url: 'https://placehold.co/600x400/fecaca/991b1b?text=Burning+Waste',
  },
  {
    description: 'Scattered garbage and plastic bags all over the park area. Very unclean.',
    lat: 31.5340,
    lng: 35.0960,
    address: 'Central Park, East Entrance',
    citizen_name: 'Layla Ibrahim',
    issue_type: 'scattered_garbage',
    severity: 'medium',
    confidence: 0.85,
    ai_summary: 'Scattered garbage including plastic bags and food waste throughout the park area. The east entrance area is particularly affected.',
    severity_explanation: 'Medium severity: scattered waste in a public recreational area affecting visitors and park usability.',
    recommended_department: 'Sanitation',
    priority_score: 5,
    priority_level: 'medium',
    status: 'in_progress',
    assigned_department: 'Sanitation',
    image_url: 'https://placehold.co/600x400/d1fae5/065f46?text=Scattered+Garbage',
  },
  {
    description: 'الحاوية ممتلئة منذ ثلاثة أيام ولم يتم إفراغها',
    lat: 31.5300,
    lng: 35.1010,
    address: 'Market Street, near the old bazaar',
    citizen_name: 'Omar Abdallah',
    issue_type: 'overflowing_bin',
    severity: 'high',
    confidence: 0.93,
    ai_summary: 'Waste container has been overflowing for approximately 3 days without collection. Waste is accumulating around the container in a busy market area.',
    severity_explanation: 'High severity: prolonged overflow in a busy commercial area affecting businesses and pedestrians.',
    recommended_department: 'Sanitation',
    priority_score: 7,
    priority_level: 'high',
    status: 'assigned',
    assigned_department: 'Sanitation',
    image_url: 'https://placehold.co/600x400/e2e8f0/475569?text=Overflowing+Bin+2',
  },
  {
    description: 'Large pile of old furniture and household items dumped near the highway exit.',
    lat: 31.5270,
    lng: 35.0930,
    address: 'Highway 60 Exit, South',
    citizen_name: 'Nadia Mansour',
    issue_type: 'illegal_dumping',
    severity: 'high',
    confidence: 0.91,
    ai_summary: 'Illegal dumping of bulky items including old furniture and household waste near the highway exit ramp. Creates visual blight and traffic safety concern.',
    severity_explanation: 'High severity: bulky waste near highway exit poses traffic safety risk and environmental concern.',
    recommended_department: 'Field Operations',
    priority_score: 7,
    priority_level: 'high',
    status: 'submitted',
    assigned_department: 'Field Operations',
    image_url: 'https://placehold.co/600x400/fef2f2/991b1b?text=Illegal+Dumping+2',
  },
  {
    description: 'Small amount of litter on the sidewalk near the bus stop.',
    lat: 31.5320,
    lng: 35.0985,
    address: 'Bus Stop 7, Main Boulevard',
    citizen_name: 'Rami Haddad',
    issue_type: 'scattered_garbage',
    severity: 'low',
    confidence: 0.82,
    ai_summary: 'Minor litter accumulation near a bus stop. Small amount of paper and plastic waste on the sidewalk.',
    severity_explanation: 'Low severity: small amount of litter, no health hazard, minor aesthetic issue.',
    recommended_department: 'Sanitation',
    priority_score: 2,
    priority_level: 'low',
    status: 'resolved',
    assigned_department: 'Sanitation',
    image_url: 'https://placehold.co/600x400/f0fdf4/166534?text=Minor+Litter',
  },
  {
    description: 'مخلفات بناء كبيرة تسد نصف الشارع وتعيق حركة المرور',
    lat: 31.5360,
    lng: 35.0940,
    address: 'Al-Quds Street, near the intersection',
    citizen_name: 'Hani Saleh',
    issue_type: 'construction_debris',
    severity: 'high',
    confidence: 0.94,
    ai_summary: 'Large construction debris blocking approximately half of the road, obstructing traffic flow. Includes concrete, metal bars, and sand piles.',
    severity_explanation: 'High severity: debris is blocking vehicle traffic and creating a safety hazard at a busy intersection.',
    recommended_department: 'Field Operations',
    priority_score: 8,
    priority_level: 'high',
    status: 'in_progress',
    assigned_department: 'Field Operations',
    image_url: 'https://placehold.co/600x400/fef9c3/854d0e?text=Construction+Debris+2',
  },
  {
    description: 'Overflowing bins near the hospital. Urgent health risk.',
    lat: 31.5335,
    lng: 35.1005,
    address: 'Near Al-Ahli Hospital, South Gate',
    citizen_name: 'Dr. Amira Zidan',
    issue_type: 'overflowing_bin',
    severity: 'critical',
    confidence: 0.96,
    ai_summary: 'Multiple overflowing waste containers near hospital south gate. Waste includes potentially hazardous medical waste mixed with general waste.',
    severity_explanation: 'Critical severity: overflowing waste near a hospital with potential medical waste contamination, immediate public health emergency.',
    recommended_department: 'Sanitation',
    priority_score: 10,
    priority_level: 'urgent',
    status: 'assigned',
    assigned_department: 'Sanitation',
    image_url: 'https://placehold.co/600x400/fecaca/991b1b?text=Hospital+Waste',
  },
  {
    description: 'Waste container is heavily damaged and leaking liquid waste onto the road.',
    lat: 31.5295,
    lng: 35.0955,
    address: 'Al-Mahatta Street',
    citizen_name: 'Youssef Awad',
    issue_type: 'broken_container',
    severity: 'high',
    confidence: 0.89,
    ai_summary: 'Severely damaged waste container leaking liquid waste onto the road surface. Container body is cracked and bottom is compromised.',
    severity_explanation: 'High severity: leaking liquid waste creates slip hazard, environmental contamination, and foul odor affecting nearby residents.',
    recommended_department: 'Container Maintenance',
    priority_score: 7,
    priority_level: 'high',
    status: 'assigned',
    assigned_department: 'Container Maintenance',
    image_url: 'https://placehold.co/600x400/dbeafe/1e40af?text=Damaged+Container',
  },
];

async function seed() {
  console.log('Starting seed...');

  for (const reportData of SAMPLE_REPORTS) {
    try {
      // Insert report
      const { data: report, error } = await supabase
        .from('reports')
        .insert(reportData)
        .select()
        .single();

      if (error) {
        console.error(`Failed to insert report: ${error.message}`);
        continue;
      }

      console.log(`Created report: ${report.id} (${report.issue_type})`);

      // Create timeline entries based on status
      const timeline = [
        { report_id: report.id, old_status: null, new_status: 'submitted', note: 'Report submitted by citizen', changed_by: 'citizen' },
        { report_id: report.id, old_status: 'submitted', new_status: 'analyzing', note: 'AI analysis started', changed_by: 'system' },
      ];

      if (report.status !== 'submitted') {
        timeline.push({
          report_id: report.id,
          old_status: 'analyzing',
          new_status: report.status === 'rejected' ? 'rejected' : 'assigned',
          note: `AI analysis complete. Classified as ${report.issue_type} with ${report.severity} severity.`,
          changed_by: 'ai',
        });
      }

      if (report.status === 'in_progress') {
        timeline.push({
          report_id: report.id,
          old_status: 'assigned',
          new_status: 'in_progress',
          note: 'Team dispatched to location.',
          changed_by: 'admin@municipality.gov',
        });
      }

      if (report.status === 'resolved') {
        timeline.push({
          report_id: report.id,
          old_status: 'assigned',
          new_status: 'in_progress',
          note: 'Team dispatched to location.',
          changed_by: 'admin@municipality.gov',
        });
        timeline.push({
          report_id: report.id,
          old_status: 'in_progress',
          new_status: 'resolved',
          note: 'Issue has been resolved. Area cleaned and restored.',
          changed_by: 'admin@municipality.gov',
        });
      }

      const { error: timelineError } = await supabase
        .from('report_updates')
        .insert(timeline);

      if (timelineError) {
        console.error(`Failed to insert timeline: ${timelineError.message}`);
      }
    } catch (err) {
      console.error(`Error seeding report: ${err.message}`);
    }
  }

  console.log(`\nSeed complete! Inserted ${SAMPLE_REPORTS.length} reports.`);
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
