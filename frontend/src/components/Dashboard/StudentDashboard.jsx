import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBell,
  faCalendarAlt,
  faBriefcase,
  faFileAlt,
  faUserGraduate,
  faChalkboardTeacher,
  faUsers,
  faBuilding,
} from '@fortawesome/free-solid-svg-icons';
import moment from 'moment';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { format } from 'date-fns';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ACCESS_TOKEN } from '../../constants';

const StudentDashboard = () => {
  const BASE_URL = import.meta.env.VITE_users_API_URL || 'http://127.0.0.1:8000';
  const accessToken = localStorage.getItem(ACCESS_TOKEN);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile } = location.state || {};
  const userId = user?.id;
  const isStudent = user?.usertype === 'student';

  const [dashboardData, setDashboardData] = useState({
    notifications: 0,
    upcomingEvents: 0,
    internships: 0,
    departmentResources: 0,
    recentInternships: [],
    recentResources: [],
    recentEvents: [],
    users: { total: 0, students: 0, alumni: 0, companies: 0, staff: 0, employedAlumni: 0, unemployedAlumni: 0 },
  });
  const [currentTime, setCurrentTime] = useState(moment().format('h:mm:ss A'));
  const [currentMonth, setCurrentMonth] = useState(moment().startOf('month'));
  const [loading, setLoading] = useState({
    notifications: false,
    events: false,
    internships: false,
    resources: false,
    users: false,
  });

  const daysInMonth = currentMonth.daysInMonth();
  const firstDayOfMonth = currentMonth.day();
  const today = moment().date();

  useEffect(() => {
    if (!accessToken || !userId || !isStudent) {
      toast.error(isStudent ? 'Please log in.' : 'Access restricted to students.', { position: 'top-right' });
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      // Notifications
      setLoading((prev) => ({ ...prev, notifications: true }));
      try {
        const response = await fetch(`${BASE_URL}/users/notifications/`, {
          method: 'GET',
          headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        });
        if (!response.ok) {
          if (response.status === 401) {
            toast.error('Unauthorized. Please log in.', { position: 'top-right' });
            navigate('/login');
            return;
          }
          throw new Error('Failed to fetch notifications');
        }
        const notifications = await response.json();
        setDashboardData((prev) => ({ ...prev, notifications: notifications.length }));
      } catch (error) {
        toast.error('Failed to fetch notifications', { position: 'top-right' });
      } finally {
        setLoading((prev) => ({ ...prev, notifications: false }));
      }

      // Upcoming Events
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
          upcomingEvents: events.length,
          recentEvents: events
            .filter((event) => moment(event.date_time).isAfter(moment()))
            .sort((a, b) => new Date(a.date_time) - new Date(b.date_time))
            .slice(0, 3),
        }));
      } catch (error) {
        toast.error('Failed to fetch events', { position: 'top-right' });
      } finally {
        setLoading((prev) => ({ ...prev, events: false }));
      }

      // Internships
      setLoading((prev) => ({ ...prev, internships: true }));
      try {
        const response = await fetch(`${BASE_URL}/events/internships/`, {
          method: 'GET',
          headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        });
        if (!response.ok) throw new Error('Failed to fetch internships');
        const internships = await response.json();
        setDashboardData((prev) => ({
          ...prev,
          internships: internships.length,
          recentInternships: internships
            .sort((a, b) => new Date(b.posted_on) - new Date(a.posted_on))
            .slice(0, 3),
        }));
      } catch (error) {
        toast.error('Failed to fetch internships', { position: 'top-right' });
      } finally {
        setLoading((prev) => ({ ...prev, internships: false }));
      }

      setLoading((prev) => ({ ...prev, resources: true }));
      try {
        const response = await fetch(`${BASE_URL}/events/access-resource-share/`, {
          method: 'GET',
          headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        });
        if (!response.ok) throw new Error('Failed to fetch resources');
        const resources = await response.json();
        const deptResources = resources.filter((resource) => resource.department === profile?.department);
        setDashboardData((prev) => ({
          ...prev,
          departmentResources: deptResources.length,
          recentResources: deptResources
            .sort((a, b) => new Date(b.created_on) - new Date(a.created_on))
            .slice(0, 3),
        }));
      } catch (error) {
        toast.error('Failed to fetch department resources', { position: 'top-right' });
      } finally {
        setLoading((prev) => ({ ...prev, resources: false }));
      }
      setLoading((prev) => ({ ...prev, users: true }));
      try {
        const response = await fetch(`${BASE_URL}/users/usercounts/`, {
          method: 'GET',
          headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        });
        if (!response.ok) throw new Error('Failed to fetch user stats');
        const users = await response.json();
        setDashboardData((prev) => ({ ...prev, users }));
      } catch (error) {
        toast.error('Failed to fetch user stats', { position: 'top-right' });
      } finally {
        setLoading((prev) => ({ ...prev, users: false }));
      }
    };

    fetchData();
  }, [accessToken, navigate, userId, isStudent, profile?.department]);

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
    { name: 'Students', value: dashboardData.users.students },
    { name: 'Faculty', value: dashboardData.users.staff },
    { name: 'Alumni', value: dashboardData.users.alumni },
    { name: 'Companies', value: dashboardData.users.companies },
  ];

  const pieData = [
    { name: 'Employed Alumni', value: dashboardData.users.employedAlumni },
    { name: 'Unemployed Alumni', value: dashboardData.users.unemployedAlumni },
  ];

  const COLORS = ['#4CAF50', '#FF5733'];

  const userProfilePic = profile?.pic || `${BASE_URL}/media/Profile_Picture/default.jpg`;

  // Greeting based on time
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
          <img src={userProfilePic} alt="User Profile" className="profile-picture" />
        )}
        <h1 className="text-2xl font-bold text-gray-800">
          {greeting}, {user?.full_name || 'Student'}!
        </h1>
        <div className="absolute right-0 text-lg font-semibold text-gray-700 pr-4">
          {currentTime}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <div className="md:col-span-3">
          <div className="grid gap-4 md:grid-cols-4 grid-cols-2 mb-8">
            <div className="bg-blue-500 p-4 text-white rounded flex items-center">
              <FontAwesomeIcon icon={faBell} className="mr-2" />
              <div>
                <p className="text-sm">Notifications</p>
                <p className="text-2xl font-bold">
                  {loading.notifications ? '...' : dashboardData.notifications}
                </p>
              </div>
            </div>
            <div className="bg-green-500 p-4 text-white rounded flex items-center">
              <FontAwesomeIcon icon={faCalendarAlt} className="mr-2" />
              <div>
                <p className="text-sm">Upcoming Events</p>
                <p className="text-2xl font-bold">
                  {loading.events ? '...' : dashboardData.upcomingEvents}
                </p>
              </div>
            </div>
            <div className="bg-yellow-500 p-4 text-white rounded flex items-center">
              <FontAwesomeIcon icon={faBriefcase} className="mr-2" />
              <div>
                <p className="text-sm">Internships</p>
                <p className="text-2xl font-bold">
                  {loading.internships ? '...' : dashboardData.internships}
                </p>
              </div>
            </div>
            <div className="bg-indigo-500 p-4 text-white rounded flex items-center">
              <FontAwesomeIcon icon={faFileAlt} className="mr-2" />
              <div>
                <p className="text-sm">Department Resources</p>
                <p className="text-2xl font-bold">
                  {loading.resources ? '...' : dashboardData.departmentResources}
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3 contact-form">
            <div className="bg-white p-6 rounded shadow contact-form">
              <h3 className="text-xl font-bold mb-4 flex items-center">
                <FontAwesomeIcon icon={faCalendarAlt} className="mr-2" />
                Upcoming Events
              </h3>
              {loading.events ? (
                <p>Loading events...</p>
              ) : dashboardData.recentEvents.length > 0 ? (
                <ul className="space-y-4">
                  {dashboardData.recentEvents.map((event) => {
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
                          to={`/event_list/${event.id}`}
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

            <div className="bg-white p-6 rounded shadow contact-form">
              <h3 className="text-xl font-bold mb-4 flex items-center">
                <FontAwesomeIcon icon={faBriefcase} className="mr-2" />
                Internship Opportunities ({loading.internships ? '...' : dashboardData.internships})
              </h3>
              {loading.internships ? (
                <p>Loading internships...</p>
              ) : dashboardData.recentInternships.length > 0 ? (
                <ul className="space-y-4">
                  {dashboardData.recentInternships.map((internship) => (
                    <li key={internship.id} className="border-b pb-2">
                      <p className="font-semibold">{internship.title}</p>
                      <p className="text-sm text-gray-600">Company: {internship.company}</p>
                      <p className="text-sm text-gray-600">
                        Posted: {format(new Date(internship.created_on), 'MMM d, yyyy')}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No internships available.</p>
              )}
              <Link
                to="/internship-opportunity"
                state={{ user, profile }}
                className="mt-4 inline-block bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
              >
                See More
              </Link>
            </div>

            <div className="bg-white p-6 rounded shadow contact-form">
              <h3 className="text-xl font-bold mb-4 flex items-center">
                <FontAwesomeIcon icon={faFileAlt} className="mr-2" />
                Department Resources ({loading.resources ? '...' : dashboardData.departmentResources})
              </h3>
              {loading.resources ? (
                <p>Loading resources...</p>
              ) : dashboardData.recentResources.length > 0 ? (
                <ul className="space-y-4">
                  {dashboardData.recentResources.map((resource) => (
                    <li key={resource.id} className="border-b pb-2">
                      <p className="font-semibold">{resource.title}</p>
                      <p className="text-sm text-gray-600">
                        Type: {resource.resource_type} | Course: {resource.course}
                      </p>
                      <p className="text-sm text-gray-600">
                        Shared: {format(new Date(resource.created_on), 'MMM d, yyyy')}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No resources available.</p>
              )}
              <Link
                to="/access-resource"
                state={{ user, profile }}
                className="mt-4 inline-block bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600"
              >
                View More
              </Link>
            </div>
          </div>
        </div>

        <div className="md:col-span-1 h-1/2 regform_body hidden md:block">
          <h2 className="text-2xl font-bold mb-4">{currentMonth.format('MMMM YYYY')} Calendar</h2>
          <div className="grid grid-cols-7 gap-1 bg-gray-100 p-4 rounded contact-form">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="p-2 text-center font-semibold">
                {day}
              </div>
            ))}
            {renderCalendar()}
          </div>
        </div>
      </div>

      <div className="bg-gray-100 p-6 rounded shadow contact-form">
        <h3 className="text-2xl font-bold mb-4">User Statistics</h3>
        {loading.users ? (
          <p>Loading user stats...</p>
        ) : (
          <>
            <div className="grid md:grid-cols-4 gap-6 mb-6">
              <div className="bg-white p-4 rounded shadow flex items-center regform_body">
                <FontAwesomeIcon icon={faUserGraduate} className="text-gray-500 mr-2" />
                <div>
                  <p className="text-sm">Students</p>
                  <p className="text-xl font-bold">{dashboardData.users.students}</p>
                </div>
              </div>
              <div className="bg-white p-4 rounded shadow flex items-center regform_body">
                <FontAwesomeIcon icon={faChalkboardTeacher} className="text-green-600 mr-2" />
                <div>
                  <p className="text-sm">Faculty</p>
                  <p className="text-xl font-bold">{dashboardData.users.staff}</p>
                </div>
              </div>
              <div className="bg-white p-4 rounded shadow flex items-center regform_body">
                <FontAwesomeIcon icon={faUsers} className="text-purple-600 mr-2" />
                <div>
                  <p className="text-sm">Alumni</p>
                  <p className="text-xl font-bold">{dashboardData.users.alumni}</p>
                </div>
              </div>
              <div className="bg-white p-4 rounded shadow flex items-center regform_body">
                <FontAwesomeIcon icon={faBuilding} className="text-orange-600 mr-2" />
                <div>
                  <p className="text-sm">Companies</p>
                  <p className="text-xl font-bold">{dashboardData.users.companies}</p>
                </div>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white p-4 rounded shadow regform_body">
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
              <div className="bg-white p-4 rounded shadow regform_body">
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

export default StudentDashboard;
