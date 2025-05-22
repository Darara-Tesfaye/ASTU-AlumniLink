import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import ASTUlogo from '../assets/images/ASTUlogo.jpg';
import Video1 from '../assets/videos/Video1.mp4'
import Video2 from '../assets/videos/Video2.mp4'
import Video3 from '../assets/videos/Video3.mp4'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSun, faMoon, faMapMarkerAlt, faClock, faLongArrowAltRight } from "@fortawesome/free-solid-svg-icons";
import users_API from "../users_API";
import LoadingIndicator from '../components/LoadingIndicator';

const navItems = [
  { label: "Home", href: "#" },
  { label: "Events", href: "#events" }, //Add upcoming events by fetching from database
  { label: "About", href: "#about" },
  { label: "Contact Us", href: "#contact" }, //Add upcoming events by fetching from database
];


const Navbar = () => {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleNavbar = () => {
    setMobileDrawerOpen(!mobileDrawerOpen);
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.body.classList.toggle('dark', !isDarkMode);
  };
  return (
    <nav className="sticky top-0 z-50 py-3 backdrop-blur-lg border-b border-neutral-700/80" >
      <div className="container px-4 mx-auto relative lg:text-sm">
        <div className="flex justify-between items-center">
          <div className="flex items-center flex-shrink-0">
            <img className="h-10 w-10 mr-2 rounded-full" src={ASTUlogo} alt="Logo" />
            <span className="text-xl tracking-tight">ASTU AlumniLink</span>
          </div>
          <ul className="hidden lg:flex ml-14 space-x-12">
            {navItems.map((item, index) => (
              <li key={index}>
                <a href={item.href}>{item.label}</a>
              </li>
            ))}
          </ul>
          <div className="hidden lg:flex justify-center space-x-12 items-center">
            <a href="/login" className="py-2 px-3 border rounded-md">
              Sign In
            </a>
            <a href="/register"
              className="bg-gradient-to-r from-blue-500 to-blue-800 py-2 px-3 rounded-md"
            >
              Create an account
            </a>
            <button
              onClick={toggleTheme}
              className="py-2 px-3 border rounded-md bg-gray-100 dark:bg-gray-800 text-neutral-1000 dark:text-blue transition duration-300 ml-80 toggle-btn"
            >
              <FontAwesomeIcon icon={isDarkMode ? faSun : faMoon} className="mr-2" />
              {isDarkMode ? 'Light Mode' : 'Dark Mode'}
            </button>

          </div>
          <div className="lg:hidden md:flex flex-col justify-end">
            <button onClick={toggleNavbar}>
              {mobileDrawerOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
        {mobileDrawerOpen && (
          <div className="fixed right-0 z-20 bg-neutral-900 w-full p-12 flex flex-col justify-center items-center lg:hidden">
            <ul>
              {navItems.map((item, index) => (
                <li key={index} className="py-4">
                  <a href={item.href}>{item.label}</a>
                </li>
              ))}
            </ul>



            <div className="flex flex-col space-y-6">
              <a href="/login" className="py-2 px-3 border rounded-md">
                Sign In
              </a>
              <a
                href="/register"
                className="py-2 px-3 rounded-md bg-gradient-to-r from-blue-500 to-blue-800"
              >
                Create an account
              </a>
              <button onClick={toggleTheme}
                className="py-2 px-3 border rounded-md bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-white transition duration-300">
                {isDarkMode ? 'Light Mode' : 'Dark Mode'}
              </button>


            </div>

          </div>
        )}
      </div>
    </nav>
  );
};
const HeroSection = () => {
  return (
    <div className="flex flex-col items-center mt-6 lg:mt-20">
      <h1 className="text-4xl sm:text-6xl lg:text-7xl text-center tracking-wide">
        Welcome Home, ASTU
      </h1>
      <h2 className="text-4xl sm:text-6xl lg:text-5xl text-center tracking-wide bg-gradient-to-r from-orange-500 to-red-800 text-transparent bg-clip-text">
        Together, We Thrive!
      </h2>
      <p className="mt-10 text-lg text-center text-neutral-500 max-w-4xl">
        Connect, innovate, and inspire through AlumniLink for a thriving university community.
        Get started today and turn your into ideas
        impactful realities.
      </p>
      <div className="flex justify-center my-10">
        <a
          href="/register"
          className="bg-gradient-to-r from-blue-500 to-blue-800 py-3 px-4 mx-3 rounded-md"
        >
          Get Started
          <FontAwesomeIcon icon={faLongArrowAltRight} className="ml-2 text-white" />
        </a>
        <a href="#events" className="py-3 px-4 mx-3 rounded-md border">
          Explore Opportunities
          <FontAwesomeIcon icon={faLongArrowAltRight} className="ml-2 text-orange" />
        </a>
      </div>
      <div className="flex mt-10 justify-center">
        <video
          autoPlay
          loop
          muted
          className="rounded-lg w-1/2 border border-orange-700 shadow-sm shadow-orange-400 mx-2 my-4"
        >
          <source src={Video1} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <video
          autoPlay
          loop
          muted
          className="rounded-lg w-1/2 border border-orange-700 shadow-sm shadow-orange-400 mx-2 my-4"
        >
          <source src={Video2} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
    </div>
  );
};
const ContactForm = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    affiliation: '',
  });
  const [statusMessage, setStatusMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    setLoading(true);

    e.preventDefault();

    try {
      const response = await users_API.post('/contactapp/feedback/', form);
      setStatusMessage('Feedback submitted successfully!, Thank you for you comments');
      setIsError(false);
      setLoading(false);
      setForm({
        name: '',
        email: '',
        subject: '',
        message: '',
        affiliation: '',
      });
      console.log(form);
    } catch (error) {
      setStatusMessage('Error submitting feedback. Please try again.');
      setIsError(true);
      setLoading(false);
    }
  };


  return (

    <div className="w-full my-8 p-4 md:p-6 bg-white shadow-md rounded-lg contact-form">

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-neutral-1000">
            Full Name
          </label>
          <input
            type="text"
            name="name"
            id="name"
            value={form.name}
            onChange={handleChange}
            className="mt-1 p-2 w-full border rounded-lg text-neutral-1000  bg-transparent"
            placeholder='Eg. Roba Chimdessa..'
            required
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-neutral-1000">
            Email Address
          </label>
          <input
            type="email"
            name="email"
            id="email"
            value={form.email}
            onChange={handleChange}
            className="mt-1 p-2 w-full border rounded-lg bg-transparent"
            placeholder='Your email here'
            required
          />
        </div>
        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-neutral-1000">
            Subject
          </label>
          <input
            type="text"
            name="subject"
            id="subject"
            value={form.subject}
            onChange={handleChange}
            className="mt-1 p-2 w-full border rounded-lg bg-transparent"
            placeholder='Subject here'
            required
          />
        </div>
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-neutral-1000">
            Message
          </label>
          <textarea
            name="message"
            id="message"
            value={form.message}
            onChange={handleChange}
            rows="4"
            className="mt-1 p-2 w-full border rounded-lg bg-transparent"
            placeholder='Your Message here'
            required
          ></textarea>
        </div>
        <div>
          <label htmlFor="affiliation" className="block text-sm font-medium text-neutral-1000">
            Affiliation
          </label>
          <select
            name="affiliation"
            id="affiliation"
            value={form.affiliation}
            onChange={handleChange}
            className="mt-1 p-2 w-full border rounded-lg bg-transparent"
            required
          >
            <option value="" disabled >
              Select your affiliation
            </option>
            <option value="student">Student</option>
            <option value="staff">Faculty Member</option>
            <option value="other">Other</option>
          </select>
        </div>
        {loading && <LoadingIndicator />}
        {statusMessage && (
          <div className={`mt-4 p-2 rounded-lg ${isError ? 'bg-red-200 text-red-800' : 'bg-green-200 text-green-800'}`}>
            {statusMessage}
          </div>
        )}



        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded">
          Send Message
        </button>
      </form>
    </div>
  );
};




// LandingPage Component
const LandingPage = () => {

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <HeroSection />

      <section id="events" className="p-10  mt-6 pt-9 items-center bg-gray-100">

        <h1 className="text-4xl sm:text-6xl lg:text-5xl text-center tracking-wide bg-gradient-to-r from-orange-500 to-red-800 text-transparent bg-clip-text">
          Events
        </h1>
        <p className="mt-10 text-lg text-center text-neutral-500 max-w-4xl">
          Check out our upcoming events:
        </p>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded shadow event-box">
            <h4 className="font-semibold">Event 1</h4>
            <p>Description of Event 1.</p>
            <div className="flex items-center">
              <FontAwesomeIcon icon={faMapMarkerAlt} className="text-red-500 mr-2" />
              <span>ODA NABE HALL</span>
            </div>
            <div className="flex items-center mt-2">
              <FontAwesomeIcon icon={faClock} className="text-blue-500 mr-2" />
              <span>2:30PM [LT]</span>
            </div>
          </div>
          <div className="bg-white p-6 rounded shadow event-box">
            <h4 className="font-semibold">EVENT 2</h4>
            <p>Description of Event 2.</p>
            <div className="flex items-center">
              <FontAwesomeIcon icon={faMapMarkerAlt} className="text-red-500 mr-2" />
              <span>Location</span>
            </div>
            <div className="flex items-center mt-2">
              <FontAwesomeIcon icon={faClock} className="text-blue-500 mr-2" />
              <span>Time</span>
            </div>
          </div>
          <div className="bg-white p-6 rounded shadow event-box">
            <h4 className="font-semibold">EVENT 3</h4>
            <p>Description of Event 3.</p>
            <div className="flex items-center">
              <FontAwesomeIcon icon={faMapMarkerAlt} className="text-red-500 mr-2" />
              <span>Location</span>
            </div>
            <div className="flex items-center mt-2">
              <FontAwesomeIcon icon={faClock} className="text-blue-500 mr-2" />
              <span>Time</span>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="p-4 md:p-10">
        <h1 className="text-4xl sm:text-6xl lg:text-5xl text-center tracking-wide bg-gradient-to-r from-orange-500 to-red-800 text-transparent bg-clip-text">
          About Us
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start p-4 md:p-10">

          <video
            autoPlay
            loop
            muted
            className="rounded-lg border border-orange-700 shadow-sm shadow-orange-400 mx-2 my-4 mt-4 w-full h-[30vh] md:h-[60vh]"
          >
            <source src={Video3} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <div className='pt-10 text-center w-full leading-relaxed md:leading-loose px-2 md:px-4'>
            <p className="text-center w-full text-neutral-1000 leading-relaxed md:leading-loose px-2 md:px-4">
              ASTU AlumniLink is dedicated to fostering a vibrant community of graduates and current students at ASTU.
              Our platform serves as a bridge, connecting alumni with each other and the university, encouraging collaboration,
              innovation, and knowledge-sharing. We empower our members to engage in meaningful interactions, access valuable
              resources, and explore opportunities that enhance their personal and professional growth. Join us in building a
              strong network that celebrates our shared experiences and drives the future of our university community.
            </p>
            <a
              href="/register"
              className="bg-gradient-to-r from-blue-500 to-blue-800 py-3 px-4 mx-3 rounded-md mt-4 inline-flex items-center"
            >Join Us
              <FontAwesomeIcon icon={faLongArrowAltRight} className="ml-2 text-white" />
            </a>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="bg-gray-100 p-4 md:p-10">
        <h1 className="text-4xl sm:text-6xl lg:text-5xl text-center tracking-wide bg-gradient-to-r from-orange-500 to-red-800 text-transparent bg-clip-text">
          Contact Us
        </h1>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-1 items-start p-4 md:p-10'>
          <div className='w-full'>
            <div>
              <h1 className="text-3xl sm:text-6xl lg:text-5xl text-center tracking-wide bg-gradient-to-r from-orange-500 to-red-800 text-transparent bg-clip-text md:mt-16 mt-4">
                Get In touch
              </h1>
              <div
                className="underline"
                style={{

                  bottom: '-5px',
                  left: '0',
                  alignItems: 'center',
                  width: '40%',
                  color: 'orange',
                  marginTop: '1rem',
                  borderBottom: '3px solid orange',
                  transform: 'translateX(75%)',
                }}
              ></div>
              <p className="text-center w-full text-neutral-1000 leading-relaxed md:leading-loose px-2 md:px-4 mt-8 md:mt-16">
                Have any questions or need assistance? We're here to help! Whether you're a prospective student, a current student,
                or a faculty member,
                feel free to reach out. Your inquiries and feedback are important to us, and we're committed to responding promptly.</p>
            </div>

          </div>


          <ContactForm />

        </div>


        {/* <form className="mt-6 max-w-md mx-auto">
          <input type="text" placeholder="Your Name" className="w-full p-2 mb-4 border rounded" required />
          <input type="email" placeholder="Your Email" className="w-full p-2 mb-4 border rounded" required />
          <textarea placeholder="Your Message" className="w-full p-2 mb-4 border rounded" required></textarea>
          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded">
            Send Message
          </button>
        </form> */}
      </section>

      {/* Footer Section */}
      <footer className="bg-gray-800 text-white p-4 text-center">
        <p>&copy; {new Date().getFullYear()} My Project. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;


// import React from 'react';


// // LandingPage Component
// const LandingPage = () => {
//   return (
//     <div className="flex flex-col min-h-screen">
//       {/* Header Section */}
//       <header className="bg-gray-800 text-white p-4">
//         <h1 className="text-3xl font-bold">My Project</h1>
//         <nav>
//           <ul className="flex space-x-4">
//             <li><a href="#features" className="hover:underline">Features</a></li>
//             <li><a href="#about" className="hover:underline">About</a></li>
//             <li><a href="#contact" className="hover:underline">Contact</a></li>
//           </ul>
//         </nav>
//       </header>

//       {/* Hero Section */}
//       <section className="flex-grow flex items-center justify-center bg-blue-600 text-white p-10">
//         <div className="text-center">
//           <h2 className="text-4xl font-semibold">Welcome to My Project</h2>
//           <p className="mt-4">Build amazing things with our platform. Start your journey today!</p>
//           <a href="#features" className="mt-6 inline-block bg-white text-blue-600 py-2 px-4 rounded shadow">
//             Get Started
//           </a>
//         </div>
//       </section>

//       {/* Features Section */}
//       <section id="features" className="p-10 bg-gray-100">
//         <h3 className="text-2xl font-bold text-center">Features</h3>
//         <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
//           <div className="bg-white p-6 rounded shadow">
//             <h4 className="font-semibold">Feature 1</h4>
//             <p>Description of feature 1.</p>
//           </div>
//           <div className="bg-white p-6 rounded shadow">
//             <h4 className="font-semibold">Feature 2</h4>
//             <p>Description of feature 2.</p>
//           </div>
//           <div className="bg-white p-6 rounded shadow">
//             <h4 className="font-semibold">Feature 3</h4>
//             <p>Description of feature 3.</p>
//           </div>
//         </div>
//       </section>

//       {/* About Section */}
//       <section id="about" className="p-10">
//         <h3 className="text-2xl font-bold text-center">About Us</h3>
//         <p className="mt-4 text-center">
//           We are dedicated to providing the best services to our users.
//           Our mission is to empower individuals and businesses to achieve more.
//         </p>
//       </section>

//       {/* Contact Section */}
//       <section id="contact" className="p-10 bg-gray-100">
//         <h3 className="text-2xl font-bold text-center">Contact Us</h3>
//         <form className="mt-6 max-w-md mx-auto">
//           <input type="text" placeholder="Your Name" className="w-full p-2 mb-4 border rounded" required />
//           <input type="email" placeholder="Your Email" className="w-full p-2 mb-4 border rounded" required />
//           <textarea placeholder="Your Message" className="w-full p-2 mb-4 border rounded" required></textarea>
//           <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded">
//             Send Message
//           </button>
//         </form>
//       </section>

//       {/* Footer Section */}
//       <footer className="bg-gray-800 text-white p-4 text-center">
//         <p>&copy; {new Date().getFullYear()} My Project. All rights reserved.</p>
//       </footer>
//     </div>
//   );
// };

// export default LandingPage;