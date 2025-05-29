
import React, { useState, useEffect } from "react";
import { Link, useNavigate , useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faUsers, faUserPlus, faCalendarPlus, faCalendarAlt, faBriefcase, faUserGraduate, faChalkboardTeacher, faBuilding } from "@fortawesome/free-solid-svg-icons";
import moment from "moment";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { format } from "date-fns";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { ACCESS_TOKEN } from "../../constants";

const AlumniDashboard = () => {
  const BASE_URL = import.meta.env.VITE_users_API_URL || "http://127.0.0.1:8000";
  const accessToken = localStorage.getItem(ACCESS_TOKEN);
  const navigate = useNavigate();  
  const location = useLocation();
  const { user , profile } = location.state || {};

  const [dashboardData, setDashboardData] = useState({
    notifications: 0,
    friends: 0,
    pendingRequests: 0,
    createdEvents: 0,
    participatableEvents: [],
    users: { total: 0, students: 0, alumni: 0, companies: 0, staff: 0, employedAlumni: 0, unemployedAlumni: 0 },
    jobs: [],
    totalJobs: 0,
  });
  const [currentTime, setCurrentTime] = useState(moment().format("h:mm:ss A"));
  const [currentMonth, setCurrentMonth] = useState(moment().startOf("month"));
  const [loading, setLoading] = useState({
    notifications: false,
    friends: false,
    events: false,
    userEvents: false,
    jobs: false,
    users: false,
  });

  const daysInMonth = currentMonth.daysInMonth();
  const firstDayOfMonth = currentMonth.day();
  const today = moment().date();

  useEffect(() => {
    const fetchData = async () => {
    setLoading((prev) => ({ ...prev, notifications: true }));
      try {
        const response = await fetch(`${BASE_URL}/users/notifications/`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        });
        if (!response.ok) {
          throw new Error("Failed to fetch notifications");
        }
        const notifications = await response.json();
        setDashboardData((prev) => ({ ...prev, notifications: notifications.length }));
      } catch (error) {
        toast.error("Failed to fetch notifications", { position: "top-right" });
      } finally {
        setLoading((prev) => ({ ...prev, notifications: false }));
      }
      setLoading((prev) => ({ ...prev, friends: true }));
      try {
        const response = await fetch(`${BASE_URL}/users/list-connections/`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        });
        if (!response.ok) {
          throw new Error("Failed to fetch connections");
        }
        const connections = await response.json();
        const accepted = connections.filter((c) => c.status === "accepted").length;
        const pending = connections.filter((c) => c.status === "pending").length;
        setDashboardData((prev) => ({ ...prev, friends: accepted, pendingRequests: pending }));
      } catch (error) {
        toast.error("Failed to fetch connections", { position: "top-right" });
      } finally {
        setLoading((prev) => ({ ...prev, friends: false }));
      }
      setLoading((prev) => ({ ...prev, events: true }));
      try {
        const response = await fetch(`${BASE_URL}/events/event-lists/`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        });
        if (!response.ok) {
          throw new Error("Failed to fetch events");
        }
        const events = await response.json();
        setDashboardData((prev) => ({ ...prev, participatableEvents: events }));
      } catch (error) {
        toast.error("Failed to fetch events", { position: "top-right" });
      } finally {
        setLoading((prev) => ({ ...prev, events: false }));
      }
      setLoading((prev) => ({ ...prev, userEvents: true }));
      try {
        const response = await fetch(`${BASE_URL}/events/user-events/`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        });
        if (!response.ok) {
          throw new Error("Failed to fetch user events");
        }
        const userEvents = await response.json();
        setDashboardData((prev) => ({ ...prev, createdEvents: userEvents.length }));
      } catch (error) {
        toast.error("Failed to fetch user events", { position: "top-right" });
      } finally {
        setLoading((prev) => ({ ...prev, userEvents: false }));
      }
      setLoading((prev) => ({ ...prev, jobs: true }));
      try {
        const response = await fetch(`${BASE_URL}/events/jobs/`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        });
        if (!response.ok) {
          throw new Error("Failed to fetch jobs");
        }
        const jobs = await response.json();
        setDashboardData((prev) => ({ ...prev, jobs: jobs.slice(0, 3), totalJobs: jobs.length }));
      } catch (error) {
        toast.error("Failed to fetch jobs", { position: "top-right" });
      } finally {
        setLoading((prev) => ({ ...prev, jobs: false }));
      }

      setLoading((prev) => ({ ...prev, users: true }));
      try {
        const response = await fetch(`${BASE_URL}/users/usercounts/`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        });
        if (!response.ok) {
          throw new Error("Failed to fetch user stats");
        }
        const users = await response.json();
        setDashboardData((prev) => ({ ...prev, users }));
      } catch (error) {
        toast.error("Failed to fetch user stats", { position: "top-right" });
      } finally {
        setLoading((prev) => ({ ...prev, users: false }));
      }
    };

    fetchData();
  }, [accessToken, navigate]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(moment().format("h:mm:ss A"));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const getEventStatus = (eventDate) => {
    const now = moment();
    const eventMoment = moment(eventDate);
    if (eventMoment.isBefore(now)) {
      return { isPast: true, display: "Past" };
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
      const isToday = day === today && moment().isSame(currentMonth, "month");
      days.push(
        <div
          key={day}
          className={`p-2 text-center border border-gray-200 regform_body ${
            isToday ? "bg-blue-500 text-white" : "bg-white"
          }`}
        >
          {day}
        </div>
      );
    }
    return days;
  };

  console.log("Dashboard" , dashboardData);

  const barData = [
    { name: "Students", value: dashboardData.users.students },
    { name: "Faculty", value: dashboardData.users.staff },
    { name: "Alumni", value: dashboardData.users.alumni },
    { name: "Companies", value: dashboardData.users.companies },
  ];

  const pieData = [
    { name: "Employed Alumni", value: dashboardData.users.employedAlumni },
    { name: "Unemployed Alumni", value: dashboardData.users.unemployedAlumni },
  ];


  const COLORS = ["#4CAF50", "#FF5733"];

  return (
    <div className="container mx-auto p-4">
      <ToastContainer />
      <div className="flex justify-end mb-4 ">
        <div className="text-lg font-semibold bg-gray-800 text-white px-4 py-2 rounded">
          {currentTime}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4 mb-8">       
        <div className="md:col-span-3">
          <div className="grid gap-4 md:grid-cols-4 grid-cols-2 mb-8">
            <div className="bg-blue-500 p-4 text-white rounded flex items-center">
              <FontAwesomeIcon icon={faEnvelope} className="mr-2" />
              <div>
                <p className="text-sm">New Notifications</p>
                <p className="text-2xl font-bold">
                  {loading.notifications ? "..." : dashboardData.notifications}
                </p>
              </div>
            </div>
            <div className="bg-green-500 p-4 text-white rounded flex items-center">
              <FontAwesomeIcon icon={faUsers} className="mr-2" />
              <div>
                <p className="text-sm">Friends</p>
                <p className="text-2xl font-bold">
                  {loading.friends ? "..." : dashboardData.friends}
                </p>
              </div>
            </div>
            <div className="bg-yellow-500 p-4 text-white rounded flex items-center">
              <FontAwesomeIcon icon={faUserPlus} className="mr-2" />
              <div>
                <p className="text-sm">Pending Requests</p>
                <p className="text-2xl font-bold">
                  {loading.friends ? "..." : dashboardData.pendingRequests}
                </p>
              </div>
            </div>
            <div className="bg-purple-500 p-4 text-white rounded flex items-center">
              <FontAwesomeIcon icon={faCalendarPlus} className="mr-2" />
              <div>
                <p className="text-sm">Created Events</p>
                <p className="text-2xl font-bold">
                  {loading.userEvents ? "..." : dashboardData.createdEvents}
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 contact-form">
            <div className="bg-white p-6 rounded shadow contact-form">
              <h3 className="text-xl font-bold mb-4 flex items-center">
                <FontAwesomeIcon icon={faCalendarAlt} className="mr-2" />
                Participatable Events
              </h3>
              {loading.events ? (
                <p>Loading events...</p>
              ) : dashboardData.participatableEvents.length > 0 ? (
                <ul className="space-y-4">
                  {dashboardData.participatableEvents.slice(0, 3).map((event) => {
                    const status = getEventStatus(event.date_time);
                    return (
                      <li key={event.id} className="border-b pb-2">
                        <p className=""><span className="font-semibold mr-1">Event: </span>
                        {event.title}</p>
                        <p className="text-sm text-gray-600">
                          <span className="font-semibold mr-1">Held on:</span>
                          {format(new Date(event.date_time), "MMM d, yyyy h:mm a")}
                          
                        </p>
                        <p className={status.isPast ? "text-red-500" : "text-green-500"}>
                      {status.display}
                      <span className="font-semibold ml-1 text-blue-500"> days left</span>

                        </p>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p>No events available.</p>
              )}
              <Link
                to="/event_list"
                className="mt-4 inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                state={ {user} }
              >
                View More
              </Link>
            </div>

            <div className="bg-white p-6 rounded shadow  contact-form">
              <h3 className="text-xl font-bold mb-4 flex items-center">
                <FontAwesomeIcon icon={faBriefcase} className="mr-2" />
                Job Opportunities ({loading.jobs ? "..." : dashboardData.totalJobs})
              </h3>
              {loading.jobs ? (
                <p>Loading jobs...</p>
              ) : dashboardData.jobs.length > 0 ? (
                <ul className="space-y-4">
                  {dashboardData.jobs.map((job) => (
                    <li key={job.id} className="border-b pb-2">
                      <p className="font-semibold">{job.title}</p>
                      <p className="text-sm text-gray-600">{job.company_profile.user.full_name || "N/A"}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No jobs available.</p>
              )}
              <Link
                to="/job-opportunity" state={{ user, profile }} 
                className="mt-4 inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                View More
              </Link>
            </div>
          </div>
        </div>
        <div className="md:col-span-1 h-1/2 regform_body">
          <h2 className="text-2xl font-bold mb-4">
            {currentMonth.format("MMMM YYYY")} Calendar
          </h2>
          <div className="grid grid-cols-7 gap-1 bg-gray-100 p-4 rounded contact-form">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="p-2 text-center font-semibold ">
                {day}
              </div>
            ))}
            {renderCalendar()}
          </div>
        </div>
      </div>
      <div className="bg-gray-100 p-6 rounded shadow contact-form" >
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
            <div className="grid md:grid-cols-2 gap-6 ">
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

export default AlumniDashboard;
