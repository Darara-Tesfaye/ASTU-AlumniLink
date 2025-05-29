
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUsers,
  faCalendarPlus,
  faBriefcase,
  faUserTie,
  faCalendarAlt,
  faUserGraduate,
  faChalkboardTeacher,
  faBuilding,
} from '@fortawesome/free-solid-svg-icons';
import moment from 'moment';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { format } from 'date-fns';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ACCESS_TOKEN } from '../../constants';


const CompanyDashboard = () => {
  const BASE_URL = import.meta.env.VITE_users_API_URL || 'http://127.0.0.1:8000';
  const accessToken = localStorage.getItem(ACCESS_TOKEN);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile } = location.state || {};
  const userId = user?.id;
  const isCompany = user?.usertype === 'company';

  const [dashboardData, setDashboardData] = useState({
    friends: 0,
    createdEvents: 0,
    internships: 0,
    jobs: 0,
    applicants: 0,
    participatableEvents: 0,
    recentEvents: [],
    recentInternships: [],
    recentJobs: [],
    recentParticipatableEvents: [],
    users: { total: 0, students: 0, alumni: 0, companies: 0, staff: 0, employedAlumni: 0, unemployedAlumni: 0 },
  });
  const [currentTime, setCurrentTime] = useState(moment().format('h:mm:ss A'));
  const [currentMonth, setCurrentMonth] = useState(moment().startOf('month'));
  const [loading, setLoading] = useState({
    friends: false,
    createdEvents: false,
    opportunities: false,
    applicants: false,
    events: false,
    users: false,
  });

  const daysInMonth = currentMonth.daysInMonth();
  const firstDayOfMonth = currentMonth.day();
  const today = moment().date();

  useEffect(() => {
    if (!accessToken || !userId || !isCompany) {
      toast.error(isCompany ? 'Please log in.' : 'Access restricted to companies.', { position: 'top-right' });
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      // Friends
      setLoading((prev) => ({ ...prev, friends: true }));
      try {
        const response = await fetch(`${BASE_URL}/users/list-connections/`, {
          method: 'GET',
          headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        });
        if (!response.ok) throw new Error('Failed to fetch connections');
        const connections = await response.json();
        const accepted = connections.filter((c) => c.status === 'accepted').length;
        setDashboardData((prev) => ({ ...prev, friends: accepted }));
      } catch (error) {
        toast.error('Failed to fetch connections', { position: 'top-right' });
      } finally {
        setLoading((prev) => ({ ...prev, friends: false }));
      }

      // Created Events
      setLoading((prev) => ({ ...prev, createdEvents: true }));
      try {
        const response = await fetch(`${BASE_URL}/events/user-events/`, {
          method: 'GET',
          headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        });
        if (!response.ok) throw new Error('Failed to fetch user events');
        const events = await response.json();
        setDashboardData((prev) => ({
          ...prev,
          createdEvents: events.length,
          recentEvents: events
            .filter((event) => moment(event.date_time).isAfter(moment()))
            .sort((a, b) => new Date(a.date_time) - new Date(b.date_time))
            .slice(0, 3),
        }));
      } catch (error) {
        toast.error('Failed to fetch created events', { position: 'top-right' });
      } finally {
        setLoading((prev) => ({ ...prev, createdEvents: false }));
      }

      setLoading((prev) => ({ ...prev, opportunities: true }));
      try {
        const response = await fetch(`${BASE_URL}/events/opportunities/`, {
          method: 'GET',
          headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        });
        if (!response.ok) throw new Error('Failed to fetch opportunities');
        const opportunities = await response.json();
        console.log('Opportunities:', opportunities);
        const companyOpportunities = opportunities.filter((opp) => opp.created_by === userId && opp.is_approved);
        const internships = companyOpportunities.filter((opp) => opp.type === 'internship');
        const jobs = companyOpportunities.filter((opp) => opp.type === 'Job');
        console.log('Internships:', internships);
        console.log('Jobs:', jobs);
        
        setDashboardData((prev) => ({
          ...prev,
          internships: internships.length,
          jobs: jobs.length,
          recentInternships: internships
            .sort((a, b) => new Date(b.posted_on) - new Date(a.posted_on))
            .slice(0, 3),
          recentJobs: jobs
            .sort((a, b) => new Date(b.posted_on) - new Date(a.posted_on))
            .slice(0, 3),
        }));
      } catch (error) {
        toast.error('Failed to fetch opportunities', { position: 'top-right' });
      } finally {
        setLoading((prev) => ({ ...prev, opportunities: false }));
      }

      // Applicants (Jobs + Internships)
      setLoading((prev) => ({ ...prev, applicants: true }));
      try {
        const [jobApplicantsResponse, internshipApplicantsResponse] = await Promise.all([
          fetch(`${BASE_URL}/events/job-applicant/`, {
            method: 'GET',
            headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
          }),
          fetch(`${BASE_URL}/events/internship-applicant/`, {
            method: 'GET',
            headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
          }),
        ]);
        if (!jobApplicantsResponse.ok || !internshipApplicantsResponse.ok) {
          throw new Error('Failed to fetch applicants');
        }
        const jobApplicants = await jobApplicantsResponse.json();
        const internshipApplicants = await internshipApplicantsResponse.json();
        setDashboardData((prev) => ({
          ...prev,
          applicants: jobApplicants.length + internshipApplicants.length,
        }));
      } catch (error) {
        toast.error('Failed to fetch applicants', { position: 'top-right' });
      } finally {
        setLoading((prev) => ({ ...prev, applicants: false }));
      }

      // Participatable Events
      setLoading((prev) => ({ ...prev, events: true }));
      try {
        const response = await fetch(`${BASE_URL}/events/event-lists/`, {
          method: 'GET',
          headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        });
        if (!response.ok) throw new Error('Failed to fetch events');
        const events = await response.json();
        setDashboardData((prev) => ({
          ...prev,
          participatableEvents: events.length,
          recentParticipatableEvents: events
            .filter((event) => moment(event.date_time).isAfter(moment()))
            .sort((a, b) => new Date(a.date_time) - new Date(b.date_time))
            .slice(0, 3),
        }));
      } catch (error) {
        toast.error('Failed to fetch participatable events', { position: 'top-right' });
      } finally {
        setLoading((prev) => ({ ...prev, events: false }));
      }

      // User Stats
      setLoading((prev) => ({ ...prev, users: true }));
      try {
        const response = await fetch(`${BASE_URL}/users/usercounts/`, {
          method: 'GET',
          headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        });
        if (!response.ok) throw new Error('Failed to fetch user stats');
        const users = await response.json();
        console.log('User Stats:', users);
        setDashboardData((prev) => ({ ...prev, users }));
      } catch (error) {
        toast.error('Failed to fetch user stats', { position: 'top-right' });
      } finally {
        setLoading((prev) => ({ ...prev, users: false }));
      }
    };

    fetchData();
  }, [accessToken, navigate, userId, isCompany]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(moment().format('h:mm:ss A'));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const getEventStatus = (eventDate) => {
    const now = moment();
    const eventMoment = moment(eventDate);
    if (eventMoment.isBefore(now)) {
      return { isPast: true, display: 'Past' };
    }
    const duration = moment.duration(eventMoment.diff(now));
    const days = Math.floor(duration.asDays());
    const hours = duration.hours();
    const minutes = duration.minutes();
    const seconds = duration.seconds();
    return {
      isPast: false,
      display: `${days}d ${hours}h ${minutes}m ${seconds}s`,
    };
  };

  const renderCalendar = () => {
    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="p-2"></div>);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const isToday = day === today && moment().isSame(currentMonth, 'month');
      days.push(
        <div
          key={day}
          className={`p-2 text-center border border-gray-200 regform_body ${
            isToday ? 'bg-blue-500 text-white' : 'bg-white'
          }`}
        >
          {day}
        </div>
      );
    }
    return days;
  };

  const barData = [
    { name: 'Students', value: dashboardData.users.students || 0 },
    { name: 'Faculty', value: dashboardData.users.staff || 0 },
    { name: 'Alumni', value: dashboardData.users.alumni || 0 },
    { name: 'Companies', value: dashboardData.users.companies || 0 },
  ];

  const pieData = [
    { name: 'Employed Alumni', value: dashboardData.users.employedAlumni || 0 },
    { name: 'Unemployed Alumni', value: dashboardData.users.unemployedAlumni || 0 },
  ];

  const COLORS = ['#4CAF50', '#FF5733'];

  const userProfilePic = profile?.pic || `${BASE_URL}/media/Profile_Picture/default.jpg`;

  const hour = moment().hour();
  let greeting;
  if (hour < 12) {
    greeting = 'Good Morning';
  } else if (hour < 17) {
    greeting = 'Good Afternoon';
  } else {
    greeting = 'Good Evening';
  }

  return (
    <div className="container mx-auto p-4">
      <ToastContainer />
      <div className="animate-fade-in mb-8 flex items-center gap-4 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg shadow relative">
        {profile?.pic && (
          <img src={userProfilePic} alt="Company Profile" className="profile-picture" />
        )}
        <h1 className="text-2xl font-bold text-gray-800">
          {greeting}, {user?.full_name || 'Company'}!
        </h1>
        <div className="absolute right-0 text-lg font-semibold text-gray-700 pr-4">
          {currentTime}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <div className="md:col-span-3">
          <div className="grid gap-4 md:grid-cols-5 grid-cols-2 mb-8">
            <div className="bg-blue-500 p-4 text-white rounded flex items-center hover:shadow-lg hover:z-10 transition">
              <FontAwesomeIcon icon={faUsers} className="mr-2" />
              <div>
                <p className="text-sm">Connections</p>
                <p className="text-2xl font-bold">{loading.friends ? '...' : dashboardData.friends}</p>
              </div>
            </div>
            <div className="bg-green-500 p-4 text-white rounded flex items-center hover:shadow-lg hover:z-10 transition">
              <FontAwesomeIcon icon={faCalendarPlus} className="mr-2" />
              <div>
                <p className="text-sm">Created Events</p>
                <p className="text-2xl font-bold">{loading.createdEvents ? '...' : dashboardData.createdEvents}</p>
              </div>
            </div>
            <div className="bg-yellow-500 p-4 text-white rounded flex items-center hover:shadow-lg hover:z-10 transition">
              <FontAwesomeIcon icon={faBriefcase} className="mr-2" />
              <div>
                <p className="text-sm">Internships Posted</p>
                <p className="text-2xl font-bold">{loading.opportunities ? '...' : dashboardData.internships}</p>
              </div>
            </div>
            <div className="bg-indigo-500 p-4 text-white rounded flex items-center hover:shadow-lg hover:z-10 transition">
              <FontAwesomeIcon icon={faBriefcase} className="mr-2" />
              <div>
                <p className="text-sm">Jobs Posted</p>
                <p className="text-2xl font-bold">{loading.opportunities ? '...' : dashboardData.jobs}</p>
              </div>
            </div>
            <div className="bg-purple-500 p-4 text-white rounded flex items-center hover:shadow-lg hover:z-10 transition">
              <FontAwesomeIcon icon={faUserTie} className="mr-2" />
              <div>
                <p className="text-sm">Applicants</p>
                <p className="text-2xl font-bold">{loading.applicants ? '...' : dashboardData.applicants}</p>
                <Link
                  to="/job-applicant"
                  state={{ user, profile }}
                  className="text-sm text-white underline hover:text-gray-200"
                >
                  View Job Applicants
                </Link>
                <Link
                  to="/applicant"
                  state={{ user, profile }}
                  className="text-sm text-white underline hover:text-gray-200 block mt-1"
                >
                  View Internship Applicants
                </Link>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 contact-form">
            <div className="bg-white p-6 rounded shadow contact-form hover:shadow-lg hover:z-10 transition">
              <h3 className="text-xl font-bold mb-4 flex items-center">
                <FontAwesomeIcon icon={faCalendarPlus} className="mr-2" />
                Created Events ({loading.createdEvents ? '...' : dashboardData.createdEvents})
              </h3>
              {loading.createdEvents ? (
                <p>Loading events...</p>
              ) : dashboardData.recentEvents.length > 0 ? (
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b">
                      <th className="py-2">Event Name</th>
                      <th className="py-2">Date</th>
                      <th className="py-2">Time Left</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardData.recentEvents.map((event) => {
                      const status = getEventStatus(event.date_time);
                      return (
                        <tr key={event.id} className="border-b">
                          <td className="py-2">{event.title}</td>
                          <td className="py-2">{format(new Date(event.date_time), 'MMM d, yyyy h:mm a')}</td>
                          <td className={status.isPast ? 'text-red-500' : 'text-green-500'}>{status.display}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <p>No upcoming events created.</p>
              )}
            </div>

            <div className="bg-white p-6 rounded shadow contact-form hover:shadow-lg hover:z-10 transition">
              <h3 className="text-xl font-bold mb-4 flex items-center">
                <FontAwesomeIcon icon={faCalendarAlt} className="mr-2" />
                Participatable Events ({loading.events ? '...' : dashboardData.participatableEvents})
              </h3>
              {loading.events ? (
                <p>Loading events...</p>
              ) : dashboardData.recentParticipatableEvents.length > 0 ? (
                <ul className="space-y-4">
                  {dashboardData.recentParticipatableEvents.map((event) => {
                    const status = getEventStatus(event.date_time);
                    return (
                      <li key={event.id} className="border-b pb-2">
                        <p className="font-semibold">{event.title}</p>
                        <p className="text-sm text-gray-600">
                          Date: {format(new Date(event.date_time), 'MMM d, yyyy h:mm a')}
                        </p>
                        <p className={status.isPast ? 'text-red-500' : 'text-green-500'}>
                          {status.display}
                        </p>
                        <Link
                          to={`/event/${event.id}`}
                          state={{ user, profile, event }}
                          className="text-blue-500 hover:underline"
                        >
                          View Details
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p>No upcoming events.</p>
              )}
              <Link
                to="/event_list"
                state={{ user, profile }}
                className="mt-4 inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                View More
              </Link>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 contact-form mt-4">
            <div className="bg-white p-6 rounded shadow contact-form hover:shadow-lg hover:z-10 transition">
              <h3 className="text-xl font-bold mb-4 flex items-center">
                <FontAwesomeIcon icon={faBriefcase} className="mr-2" />
                Posted Internships ({loading.opportunities ? '...' : dashboardData.internships})
              </h3>
              {loading.opportunities ? (
                <p>Loading internships...</p>
              ) : dashboardData.recentInternships.length > 0 ? (
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b">
                      <th className="py-2">Title</th>
                      <th className="py-2">Role</th>
                      <th className="py-2">Type</th>
                      <th className="py-2">Posted Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardData.recentInternships.map((internship) => (
                      <tr key={internship.id} className="border-b">
                        <td className="py-2">{internship.title}</td>
                        <td className="py-2">{internship.role}</td>
                        <td className="py-2">{internship.type}</td>
                        <td className="py-2">{format(new Date(internship.created_on), 'MMM d, yyyy')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>No internships posted.</p>
              )}
            </div>

            <div className="bg-white p-6 rounded shadow contact-form hover:shadow-lg hover:z-10 transition">
              <h3 className="text-xl font-bold mb-4 flex items-center">
                <FontAwesomeIcon icon={faBriefcase} className="mr-2" />
                Posted Jobs ({loading.opportunities ? '...' : dashboardData.jobs})
              </h3>
              {loading.opportunities ? (
                <p>Loading jobs...</p>
              ) : dashboardData.recentJobs.length > 0 ? (
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b">
                      <th className="py-2">Title</th>
                      <th className="py-2">Role</th>
                      <th className="py-2">Type</th>
                      <th className="py-2">Posted Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardData.recentJobs.map((job) => (
                      <tr key={job.id} className="border-b">
                        <td className="py-2">{job.title}</td>
                        <td className="py-2">{job.role}</td>
                        <td className="py-2">{job.type}</td>
                        <td className="py-2">{format(new Date(job.created_on), 'MMM d, yyyy')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>No jobs posted.</p>
              )}
            </div>
          </div>
        </div>

        <div className="md:col-span-1 h-1/2 regform_body hidden md:block">
          <h2 className="text-2xl font-bold mb-4">{currentMonth.format('MMMM YYYY')} Calendar</h2>
          <div className="grid grid-cols-7 gap-1 bg-gray-100 p-4 rounded">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="p-2 text-center font-semibold">
                {day}
              </div>
            ))}
            {renderCalendar()}
          </div>
        </div>
      </div>

      <div className="bg-gray-100 p-6 rounded shadow contact-form hover:shadow-lg hover:z-10 transition">
        <h3 className="text-2xl font-bold mb-4">User Statistics</h3>
        {loading.users ? (
          <p>Loading user stats...</p>
        ) : (
          <>
            <div className="grid md:grid-cols-4 gap-6 mb-6">
              <div className="bg-white p-4 rounded shadow flex items-center regform_body hover:shadow-lg hover:z-10 transition">
                <FontAwesomeIcon icon={faUserGraduate} className="text-gray-500 mr-2" />
                <div>
                  <p className="text-sm">Students</p>
                  <p className="text-xl font-bold">{dashboardData.users.students || 0}</p>
                </div>
              </div>
              <div className="bg-white p-4 rounded shadow flex items-center regform_body hover:shadow-lg hover:z-10 transition">
                <FontAwesomeIcon icon={faChalkboardTeacher} className="text-green-600 mr-2" />
                <div>
                  <p className="text-sm">Faculty</p>
                  <p className="text-xl font-bold">{dashboardData.users.staff || 0}</p>
                </div>
              </div>
              <div className="bg-white p-4 rounded shadow flex items-center regform_body hover:shadow-lg hover:z-10 transition">
                <FontAwesomeIcon icon={faUsers} className="text-purple-600 mr-2" />
                <div>
                  <p className="text-sm">Alumni</p>
                  <p className="text-xl font-bold">{dashboardData.users.alumni || 0}</p>
                </div>
              </div>
              <div className="bg-white p-4 rounded shadow flex items-center regform_body hover:shadow-lg hover:z-10 transition">
                <FontAwesomeIcon icon={faBuilding} className="text-orange-600 mr-2" />
                <div>
                  <p className="text-sm">Companies</p>
                  <p className="text-xl font-bold">{dashboardData.users.companies || 0}</p>
                </div>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white p-4 rounded shadow-lg regform_body hover:shadow-lg">
                <h4 className="text-lg font-semibold mb-2">User Distribution</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={barData}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="#007BFF" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-white p-4 rounded shadow-lg regform_body">
                <h4 className="text-lg font-semibold mb-2">Alumni Employment Status</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={pieData} dataKey="value" cx="50%" cy="50%" outerRadius={80} label>
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CompanyDashboard;
