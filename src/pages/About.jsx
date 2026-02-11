import React, { useState } from 'react';
import { Users, Award, Clock, Shield, CheckCircle, Mail, X } from 'lucide-react';
import Footer from '../components/Footer';
import NavBar from '../components/NavBar';

const AboutUs = () => {
  const [selectedMember, setSelectedMember] = useState(null);

  
  const backgroundImage = "url('src/assets/Water purifier.jpg')";

  
  const teamMembers = [
    {
      id: 1,
      name: "Gopal",
      position: "Founder & CEO",
      image: "src/assets/ceo-2.jpeg",
      bio: "With 20+ years in water purification industry, founded Everlast to make clean water accessible.",
      email: "gopal@gmail.com"
    },
    {
      id: 2,
      name: "Dhanu Raj",
      position: "Technical Director",
      image: "src/assets/techdirector.jpeg",
      bio: "Expert in RO, UV, and UF technologies with 12+ years of experience.",
      email: "priya@gmail.com"
    },
    {
      id: 3,
      name: "Udaya Rai",
      position: "Service Head",
      image: "src/assets/tecsupport.jpeg",
      bio: "Manages nationwide service network ensuring timely support.",
      email: "udayarai@gmail.com"
    }
  ];

  // Timeline Data
  const timeline = [
    { year: "2010", event: "Company Founded", description: "Started with a vision for clean water" },
    { year: "2014", event: "First 1000 Customers", description: "Expanded across Kasaragode & Mangalore" },
    { year: "2018", event: "Technology Upgrade", description: "Introduced advanced RO systems" },
    { year: "2023", event: "10K+ Families Served", description: "All Over Kasaragode & Mangalore" }
  ];

  // Mission Vision Values
  const mvv = [
    {
      icon: <TargetIcon />,
      title: "Our Mission",
      description: "Provide pure, safe drinking water through innovative purification solutions."
    },
    {
      icon: <EyeIcon />,
      title: "Our Vision",
      description: "Become India's most trusted water solution partner."
    },
    {
      icon: <HeartIcon />,
      title: "Our Values",
      description: "Quality, Integrity, and Customer-first approach."
    }
  ];

  // Why Choose Us
  const features = [
    { icon: <Shield className="w-6 h-6" />, text: "ISO Certified Quality" },
    { icon: <Clock className="w-6 h-6" />, text: "24/7 Customer Support" },
    { icon: <Award className="w-6 h-6" />, text: "Expert Technicians" },
    { icon: <Users className="w-6 h-6" />, text: "10,000+ Happy Families" },
    { icon: <CheckCircle className="w-6 h-6" />, text: "Latest Technology" },
    { icon: <Shield className="w-6 h-6" />, text: "1 Year Warranty" }
  ];

  // Stats
  const stats = [
    { number: 12, label: "Years Experience" },
    { number: 10000, label: "Happy Customers" },
    { number: 50, label: "Cities Served" }
  ];

  return (
    <>
      <NavBar/>
      <div 
        className="min-h-screen bg-[#89CFF3] relative"
        style={{
          backgroundImage: `${backgroundImage}`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        {/* Overlay for better readability */}
        <div className="absolute inset-0  bg-opacity-20"></div>
        
        
        <div className="relative z-10">
          {/* Hero Section */}
          <section className="py-16 lg:py-24 bg-linear-to-br from-[#CDF5FD]/ to-[#A0E9FF]/ backdrop-blur-sm">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h1 className="text-4xl lg:text-5xl font-bold text-[#0B0C10] mb-6 transition-all duration-500 ease-in-out">
                About <span className="text-[#050809]">Everlast Water Solution</span>
              </h1>
              <p className="text-xl text-[#0B0C10] max-w-3xl mx-auto transition-all duration-500 ease-in-out delay-100">
                Trusted by thousands of families across India for pure, safe drinking water solutions since 2010.
              </p>
            </div>
          </section>

          
          {/* Mission Vision Values */}
          <section className="py-16 bg-[#CDF5FD]/ backdrop-blur-sm">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-3xl font-bold text-center text-[#0B0C10] mb-12 transition-all duration-300">Our Core Principles</h2>
              <div className="grid md:grid-cols-3 gap-8">
                {mvv.map((item, index) => (
                  <div
                    key={index}
                    className="bg-white/95 backdrop-blur-sm p-8 rounded-lg shadow-sm border border-gray-100 text-center transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg"
                  >
                    <div className="text-[#00A9FF] flex justify-center mb-4 transition-transform duration-300 hover:scale-110">
                      {item.icon}
                    </div>
                    <h3 className="text-xl font-semibold text-[#0B0C10] mb-4">{item.title}</h3>
                    <p className="text-gray-700">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Why Choose Us */}
          <section className="py-16 bg-[#89CFF3]/ backdrop-blur-sm">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-3xl font-bold text-center text-[#0B0C10] mb-12 transition-all duration-300">Why Choose Us</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {features.map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 p-4 rounded-lg border border-gray-200 bg-white/95 backdrop-blur-sm transition-all duration-300 ease-in-out hover:scale-105 hover:border-[#00A9FF] hover:shadow-lg"
                  >
                    <div className="text-[#00A9FF] transition-transform duration-300 hover:scale-110">
                      {feature.icon}
                    </div>
                    <span className="text-[#0B0C10] font-medium">{feature.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Statistics */}
          <section className="py-16  to-[#010506] text-black backdrop-blur-sm">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                {stats.map((stat, index) => (
                  <div
                    key={index}
                    className="transition-all duration-500 ease-in-out hover:scale-110"
                  >
                    <div className="text-4xl lg:text-5xl font-bold mb-2 transition-all duration-300">
                      {stat.number}+
                    </div>
                    <div className="text-[#050505] text-lg font-medium transition-all duration-300">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Team Section */}
          <section className="py-16 bg-[#CDF5FD]/ backdrop-blur-sm">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-3xl font-bold text-center text-[#0B0C10] mb-12 transition-all duration-300">Meet Our Team</h2>
              <div className="grid md:grid-cols-3 gap-8">
                {teamMembers.map((member, index) => (
                  <div
                    key={member.id}
                    className="bg-white/95 backdrop-blur-sm rounded-lg shadow-sm overflow-hidden cursor-pointer transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg"
                    onClick={() => setSelectedMember(member)}
                  >
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-48 object-cover transition-transform duration-300 hover:scale-110"
                    />
                    <div className="p-6">
                      <h3 className="text-xl font-semibold text-[#0B0C10] mb-2">{member.name}</h3>
                      <p className="text-[#00A9FF] font-medium mb-3">{member.position}</p>
                      <p className="text-gray-700 text-sm">{member.bio}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Team Member Modal */}
          {selectedMember && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 transition-all duration-300">
              <div className="bg-white rounded-lg max-w-md w-full mx-auto transform transition-all duration-300 scale-100 backdrop-blur-sm">
                <div className="relative">
                  <button
                    onClick={() => setSelectedMember(null)}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 z-10 bg-white rounded-full p-2 shadow-lg transition-all duration-200 hover:scale-110 hover:bg-gray-100"
                  >
                    <X className="w-6 h-6" />
                  </button>

                  <img
                    src={selectedMember.image}
                    alt={selectedMember.name}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />

                  <div className="p-6">
                    <h3 className="text-2xl font-bold text-[#0B0C10] mb-2">{selectedMember.name}</h3>
                    <p className="text-[#00A9FF] font-medium mb-4">{selectedMember.position}</p>
                    <p className="text-gray-600 mb-4">{selectedMember.bio}</p> 

                    <div className="flex items-center gap-2 text-gray-600 transition-all duration-200 hover:text-[#00A9FF]">
                      <Mail className="w-4 h-4" />
                      <span className="text-sm">{selectedMember.email}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer/>
    </>
  );
};

// Icon Components
const TargetIcon = () => (
  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
  </svg>
);

const EyeIcon = () => (
  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const HeartIcon = () => (
  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
);

export default AboutUs;