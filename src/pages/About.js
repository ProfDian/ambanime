import React from 'react';
import { motion } from 'framer-motion';
// Correct imports for layout components
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import './About.css';
import { RiFirebaseFill } from "react-icons/ri";

// Import for React Icons (you'll need to install this package)
import { 
  FaReact, 
  FaCss3Alt, 
  FaHtml5, 
  FaGithub,
  FaNodeJs
} from 'react-icons/fa';

// imports for developer images
import fattahImage from '../components/images/fattah.jpg';
import mamanImage from '../components/images/maman.jpg';
import rizkyImage from '../components/images/rizky.jpg';
import hafianImage from '../components/images/hafian.jpg';
import zeinImage from '../components/images/zein.jpg';

const About = () => {
  const developers = [
    {
      name: "Fattah",
      alias: "The Oppenheimer",
      nim: "21120122120028",
      image: fattahImage,
      role: "Lead Developer"
    },
    {
      name: "Alman",
      alias: "The MamanSkuy",
      nim: "21120122120024",
      image: mamanImage,
      role: "Backend Developer"
    },
    {
      name: "Rizky",
      alias: "The K.I.K.I",
      nim: "TBA",
      image: rizkyImage,
      role: "Frontend Developer"
    },
    {
      name: "Hafian",
      alias: "The Doctor Tirta",
      nim: "TBA",
      image: hafianImage,
      role: "Full Stack Developer"
    },
    {
      name: "Zein",
      alias: "The Zainchovics",
      nim: "21120122140151",
      image: zeinImage,
      role: "UI/UX Developer"
    }
  ];

  const techStack = [
    { name: "React", icon: <FaReact />, color: "#61DAFB" },
    { name: "Firebase", icon: <RiFirebaseFill />, color: "#FFCA28" },
    { name: "CSS3", icon: <FaCss3Alt />, color: "#1572B6" },
    { name: "HTML5", icon: <FaHtml5 />, color: "#E34F26" },
    { name: "Node.js", icon: <FaNodeJs />, color: "#339933" },
    { name: "GitHub", icon: <FaGithub />, color: "#ffffff" }
  ];

  const membershipLevels = [
    {
      title: "Free User",
      features: ["Basic anime browsing", "Limited reviews", "Public lists"]
    },
    {
      title: "Premium User",
      features: ["Ad-free experience", "Unlimited reviews", "Private lists", "Early access"]
    },
    {
      title: "Admin",
      features: ["Content management", "User management", "Analytics access", "Full control"]
    }
  ];

  return (
      <div className="about-container">
        <Navbar />
        <motion.div 
          className="hero-section"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <h1>Welcome to Amba Nime</h1>
          <p>Your Ultimate Anime Discovery Platform</p>
        </motion.div>

        <motion.section 
          className="description-section"
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2>About AmbaNime</h2>
          <p>AmbaNime is a cutting-edge anime platform designed to provide anime enthusiasts with a comprehensive and engaging experience. Our platform combines powerful search capabilities, personalized recommendations, and a vibrant community to create the ultimate anime discovery destination.</p>
        </motion.section>

        <motion.section 
          className="tech-stack-section"
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2>Technology Stack</h2>
          <div className="tech-grid">
            {techStack.map((tech, index) => (
              <motion.div 
                key={tech.name} 
                className="tech-card"
                whileHover={{ scale: 1.05 }}
                style={{ '--accent-color': tech.color }}
              >
                {tech.icon}
                <span>{tech.name}</span>
              </motion.div>
            ))}
          </div>
        </motion.section>

        <motion.section 
          className="team-section"
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2>Meet Our Team</h2>
          <div className="developers-grid">
            {developers.map((dev, index) => (
              <motion.div 
                key={dev.name}
                className="developer-card"
                whileHover={{ y: -10 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="dev-image">
                  <img src={dev.image} alt={dev.name} />
                </div>
                <div className="dev-info">
                  <h3>{dev.name}</h3>
                  <div className="dev-alias">{dev.alias}</div>
                  <div className="dev-nim">NIM: {dev.nim}</div>
                  <div className="dev-role">{dev.role}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        <motion.section 
          className="membership-section"
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2>Membership Levels</h2>
          <div className="membership-grid">
            {membershipLevels.map((level, index) => (
              <motion.div 
                key={level.title}
                className="membership-card"
                whileHover={{ scale: 1.03 }}
              >
                <h3>{level.title}</h3>
                <ul>
                  {level.features.map((feature, i) => (
                    <li key={i}>{feature}</li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

        </motion.section>
        {/* Footer */}
        <Footer />
    </div>
  );
};

export default About;