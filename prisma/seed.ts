import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  const doctors = [
    {
      name: "Dr. Priya Sharma",
      email: "priya.sharma@dentwise.com",
      phone: "+91 98765 43210",
      speciality: "General Dentistry",
      bio: "15+ years of experience in comprehensive dental care. BDS from Mumbai University, MDS in Conservative Dentistry. Specialized in painless root canal treatments and cosmetic fillings.",
      imageUrl: "https://randomuser.me/api/portraits/women/44.jpg",
      gender: "FEMALE" as const,
      isActive: true,
    },
    {
      name: "Dr. Rajesh Kumar",
      email: "rajesh.kumar@dentwise.com",
      phone: "+91 98765 43211",
      speciality: "Orthodontics",
      bio: "Specialist in invisible braces and smile correction. MDS in Orthodontics from Manipal University. Successfully treated over 2000+ patients with advanced alignment techniques.",
      imageUrl: "https://randomuser.me/api/portraits/men/32.jpg",
      gender: "MALE" as const,
      isActive: true,
    },
    {
      name: "Dr. Anjali Patel",
      email: "anjali.patel@dentwise.com",
      phone: "+91 98765 43212",
      speciality: "Cosmetic Dentistry",
      bio: "Expert in teeth whitening, veneers, and smile makeovers. BDS from Gujarat University, certified in laser dentistry. Featured in India Today for innovative cosmetic procedures.",
      imageUrl: "https://randomuser.me/api/portraits/women/65.jpg",
      gender: "FEMALE" as const,
      isActive: true,
    },
    {
      name: "Dr. Arjun Reddy",
      email: "arjun.reddy@dentwise.com",
      phone: "+91 98765 43213",
      speciality: "Pediatric Dentistry",
      bio: "Caring for children's dental health for over 12 years. MDS in Pedodontics from Bangalore. Known for gentle approach with kids and preventive care expertise.",
      imageUrl: "https://randomuser.me/api/portraits/men/45.jpg",
      gender: "MALE" as const,
      isActive: true,
    },
    {
      name: "Dr. Sneha Iyer",
      email: "sneha.iyer@dentwise.com",
      phone: "+91 98765 43214",
      speciality: "Periodontics",
      bio: "Gum disease prevention and treatment specialist. BDS from Chennai Dental College, MDS in Periodontics. Expert in dental implants and gum surgeries with 10+ years experience.",
      imageUrl: "https://randomuser.me/api/portraits/women/28.jpg",
      gender: "FEMALE" as const,
      isActive: true,
    },
    {
      name: "Dr. Vikram Singh",
      email: "vikram.singh@dentwise.com",
      phone: "+91 98765 43215",
      speciality: "Oral Surgery",
      bio: "Experienced in complex dental surgeries and wisdom tooth extractions. MDS in Oral & Maxillofacial Surgery from AIIMS Delhi. Performed 5000+ successful surgical procedures.",
      imageUrl: "https://randomuser.me/api/portraits/men/52.jpg",
      gender: "MALE" as const,
      isActive: true,
    },
    {
      name: "Dr. Meera Desai",
      email: "meera.desai@dentwise.com",
      phone: "+91 98765 43216",
      speciality: "Endodontics",
      bio: "Root canal specialist with advanced microscopic techniques. BDS from Pune University, MDS in Conservative Dentistry & Endodontics. Known for painless single-sitting RCT.",
      imageUrl: "https://randomuser.me/api/portraits/women/72.jpg",
      gender: "FEMALE" as const,
      isActive: true,
    },
    {
      name: "Dr. Karthik Menon",
      email: "karthik.menon@dentwise.com",
      phone: "+91 98765 43217",
      speciality: "Prosthodontics",
      bio: "Expert in dental crowns, bridges, and dentures. MDS in Prosthodontics from Manipal. Specialized in implant-supported prosthesis and full mouth rehabilitation.",
      imageUrl: "https://randomuser.me/api/portraits/men/67.jpg",
      gender: "MALE" as const,
      isActive: true,
    },
    {
      name: "Dr. Kavya Nair",
      email: "kavya.nair@dentwise.com",
      phone: "+91 98765 43218",
      speciality: "Oral Medicine & Radiology",
      bio: "Specialist in oral cancer screening and digital dental imaging. BDS from Kerala University, MDS in Oral Medicine. Pioneer in 3D dental imaging and early disease detection.",
      imageUrl: "https://randomuser.me/api/portraits/women/89.jpg",
      gender: "FEMALE" as const,
      isActive: true,
    },
    {
      name: "Dr. Aditya Joshi",
      email: "aditya.joshi@dentwise.com",
      phone: "+91 98765 43219",
      speciality: "Implantology",
      bio: "Leading dental implant surgeon with international training. BDS from Mumbai, Fellowship in Implantology from Germany. Placed over 3000 successful implants with 98% success rate.",
      imageUrl: "https://randomuser.me/api/portraits/men/71.jpg",
      gender: "MALE" as const,
      isActive: true,
    },
  ];

  for (const doctor of doctors) {
    await prisma.doctor.upsert({
      where: { email: doctor.email },
      update: {},
      create: doctor,
    });
  }

  console.log("✅ Database seeded with 10 doctors!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });