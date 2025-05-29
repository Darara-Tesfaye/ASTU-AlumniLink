import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ACCESS_TOKEN } from "../../constants";

const AdminManageOpportunities = () => {
  const [opportunities, setOpportunities] = useState([]);
  const [expandedOpportunityId, setExpandedOpportunityId] = useState(null);
  const BASE_URL = import.meta.env.VITE_users_API_URL;

  useEffect(() => {
    const fetchOpportunities = async () => {
      try {
        const accessToken = localStorage.getItem(ACCESS_TOKEN);
        const response = await fetch(`${BASE_URL}/events/opportunities/`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch opportunities');
        }
        const data = await response.json();
        const parsedOpportunities = data.map(opportunity => {
          const parsedDepartments = typeof opportunity.departments === 'string'
            ? JSON.parse(opportunity.departments)
            : Array.isArray(opportunity.departments)
              ? opportunity.departments
              : [];

          const formattedDepartments = parsedDepartments.join(', ');

          return {
            ...opportunity,
            departments: formattedDepartments,
          };
        });

        setOpportunities(parsedOpportunities);
      } catch (error) {
        console.error("Error fetching opportunities:", error);
      }
    };

    fetchOpportunities();
  }, []);

  console.log("Opportunities:", opportunities);



  const handleViewMore = (id) => {
    setExpandedOpportunityId(expandedOpportunityId === id ? null : id);
  };

  const handleApprove = async (id) => {
    try {
      const accessToken = localStorage.getItem(ACCESS_TOKEN);

      const response = await fetch(`${BASE_URL}/events/opportunities/approve/${id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ is_approved: true }),
      });

      if (!response.ok) {
        throw new Error('Failed to approve opportunity');
      }
      const opportunityName = opportunities.find(opportunity => opportunity.id === id).title;

      setOpportunities(opportunities.map(opportunity =>
        opportunity.id === id ? { ...opportunity, is_approved: true } : opportunity
      ));
      toast.success(`Opportunity "${opportunityName}" approved successfully`);
    } catch (error) {
      console.error("Error approving opportunity:", error);
    }
  };

  const handleCancelApproval = async (id) => {
    try {
      const accessToken = localStorage.getItem(ACCESS_TOKEN);

      const response = await fetch(`${BASE_URL}/events/opportunities/approve/${id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ is_approved: false }),
      });

      if (!response.ok) {
        throw new Error('Failed to cancel approval');
      }
      const opportunityName = opportunities.find(opportunity => opportunity.id === id).title;

      setOpportunities(opportunities.map(opportunity =>
        opportunity.id === id ? { ...opportunity, is_approved: false } : opportunity
      ));
      toast.success(`Opportunity "${opportunityName}" approval canceled successfully`);
    } catch (error) {
      console.error("Error canceling approval:", error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this opportunity?")) {
      try {
        const accessToken = localStorage.getItem(ACCESS_TOKEN);

        const response = await fetch(`${BASE_URL}/events/opportunities/${id}/`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        });
        if (!response.ok) {
          throw new Error('Failed to delete opportunity');
        }
        const opportunityName = opportunities.find(opportunity => opportunity.id === id).title;

        setOpportunities(opportunities.filter(opportunity => opportunity.id !== id));
        toast.success(`Opportunity "${opportunityName}" deleted successfully`);
      } catch (error) {
        console.error("Error deleting opportunity:", error);
      }
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 min-h-screen flex flex-col mt-0 regform_body">
      <ToastContainer />
      <div className="flex flex-1 regform_body">
        <div className="flex-1  px-4 sm:px-6 py-4  w-full ml-0 ">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mb-6 sm:mb-8 tracking-tight">
            Manage Opportunity Listings
          </h1>

          <div className="bg-white p-4 sm:p-6 sm:px-16 lg:p-8 rounded-xl shadow-xl from-white to-blue-50 border border-blue-100 ml-0 regform_body">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-700 mb-4 sm:mb-6 tracking-wide dark_text">
              Opportunity Listings
            </h2>
            {opportunities.length > 0 ? (
              <div className="overflow-x-auto event_table_conatiner ">
                <table className="w-full border-collapse border border-gray-200">
                  <thead>
                    <tr className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white  event_table">
                      <th className="p-3 sm:p-4 text-left  contact-form">Title</th>
                      <th className="p-3 sm:p-4 text-left  contact-form">Description</th>
                      <th className="p-3 sm:p-4 text-left  contact-form">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {opportunities.map((opportunity, index) => (
                      <React.Fragment key={opportunity.id}>
                        <tr className={`${index % 2 === 0 ? "bg-gray-50" : "bg-white"} hover:bg-blue-100`}>
                          <td className="p-3 sm:p-4 text-gray-800 opportunity_table">{opportunity.title}</td>
                          <td className="p-3 sm:p-4 text-gray-800 opportunity_table">{opportunity.description}</td>

                          <td className="p-3 sm:p-4 opportunity_table">
                            <button onClick={() => handleViewMore(opportunity.id)} className="bg-blue-500 text-white px-4 py-2 rounded-lg">
                              {expandedOpportunityId === opportunity.id ? "View Less" : "View More"}
                            </button>

                            {opportunity.is_approved ? (
                              <>
                                <button disabled className="bg-green-400 text-white rounded-lg px-4 py-2 ml-2 mt-2">Approved</button>
                                <button onClick={() => handleCancelApproval(opportunity.id)} className="bg-yellow-500 text-white rounded-lg px-4 py-2 ml-2 mt-2">Cancel Approval</button>
                              </>
                            ) : (
                              <>
                                <button onClick={() => handleApprove(opportunity.id)} className="bg-green-500 text-white rounded-lg px-4 py-2 ml-2 mt-2">Approve</button>
                                <button onClick={() => handleDelete(opportunity.id)} className="bg-red-500 text-white rounded-lg ml-2 px-4 py-2 mt-2">Delete</button>
                              </>
                            )}
                          </td>
                        </tr>
                        {expandedOpportunityId === opportunity.id && (
                          <tr className="bg-blue-100 contact-form">
                            <td colSpan="6" className="p-4">
                              <h3 className="font-semibold text-center tracking-wide bg-gradient-to-r from-orange-500 to-red-800 text-transparent bg-clip-text">Opportunity Details</h3>
                              <p><strong>Description:</strong> {opportunity.description}</p>
                              <p><strong>Opportunity type:</strong> {opportunity.type}</p>
                              {opportunity.experience_years && (
                                <p><strong>Experience Years: </strong>{" "}
                                  {opportunity.experience_years}
                                </p>)
                              }
                              {opportunity.batch && (
                                <p><strong>Batch: </strong>{" "}
                                  {opportunity.batch}</p>
                              )}
                              <p><strong>Department:</strong> {opportunity.departments || opportunity.field_of_study}</p>
                              <p><strong>Contact Email:</strong> {opportunity.company_profile.user.email}</p>
                              <p><strong>Company Name:</strong> {opportunity.company_profile.company_name}</p>
                              <p><strong>Contact Person:</strong> {opportunity.company_profile.contact_person_phone_number}</p>
                              <p><strong>Company's Address:</strong> {opportunity.company_profile.company_address}</p>
                              <p><strong>Created on:</strong> {new Date(opportunity.created_on).toLocaleString()}</p>
                              {opportunity.start_date && (
                                <p>
                                  <span className="block white-space-pre"><strong>Start date:</strong>{" "}
                                  {new Date(opportunity.start_date).toLocaleDateString()}
                                  </span>
                                 
                                  <strong>Status</strong>{" "}
                                  {new Date(opportunity.start_date) > new Date() ? (
                                    <span> - Upcoming</span>
                                  ) : (
                                    <span> - Past</span>
                                  )}
                                </p>
                              )}


                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-center text-gray-600">No opportunities available to manage.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminManageOpportunities;