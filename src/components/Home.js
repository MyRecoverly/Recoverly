import React, { useState, useEffect, useCallback } from "react";
import KPICard from "../components/KPICard";
import LineGraph from "../components/LineGraph";
import { generateMockData, generateDataForTotal } from "../utils/mockData";
import { getKpiValues } from "../utils/kpiHelpers";
import { supabase } from "../supabaseClient";

const Home = () => {
  const [timePeriod, setTimePeriod] = useState("30d");

  const purple = "#8525b2";
  const lightPurple = "#e2ceed";
  const orange = "#f59e0b";
  const lightOrange = "#fef3c7";

  const [mockKpiData, setMockKpiData] = useState({
    recoveredRevenue: [],
    emailsSent: [],
    clickThroughRate: [],
    averageCartValue: [],
  });

  const [showContactForm, setShowContactForm] = useState(false);
  const [contactEmail, setContactEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submissionMessage, setSubmissionMessage] = useState("");
  const [submissionError, setSubmissionError] = useState("");

  useEffect(() => {
    setMockKpiData({
      recoveredRevenue: generateMockData(60, 5500, 700),
      emailsSent: generateMockData(60, 350, 50),
      clickThroughRate: generateMockData(60, 20, 3),
      averageCartValue: generateMockData(60, 70, 10),
    });
  }, []);

  const getKpiValuesFunc = useCallback(
    (data, calculationType = "sum", kpiTitle) => {
      const periodLength =
        timePeriod === "24h" ? 24 : timePeriod === "7d" ? 7 : 30;
      let currentPeriodDataForGraph = [];
      let previousPeriodDataForGraph = [];
      let displayValue;

      if (kpiTitle === "Recovered Revenue") {
        if (timePeriod === "24h") {
          displayValue = 240.66;
          currentPeriodDataForGraph = generateDataForTotal(
            periodLength,
            displayValue
          );
          previousPeriodDataForGraph = generateDataForTotal(
            periodLength,
            230.15
          );
        } else if (timePeriod === "7d") {
          displayValue = 1550.23;
          currentPeriodDataForGraph = generateDataForTotal(
            periodLength,
            displayValue
          );
          previousPeriodDataForGraph = generateDataForTotal(
            periodLength,
            1500.5
          );
        } else if (timePeriod === "30d") {
          displayValue = 6432.17;
          currentPeriodDataForGraph = generateDataForTotal(
            periodLength,
            displayValue
          );
          previousPeriodDataForGraph = generateDataForTotal(
            periodLength,
            6200.25
          );
        }
      } else if (kpiTitle === "Average Cart Value") {
        if (timePeriod === "24h") {
          displayValue = 36.17;
          currentPeriodDataForGraph = generateDataForTotal(
            periodLength,
            displayValue * periodLength
          );
          previousPeriodDataForGraph = generateDataForTotal(
            periodLength,
            35.5 * periodLength
          );
        } else if (timePeriod === "7d") {
          displayValue = 37.89;
          currentPeriodDataForGraph = generateDataForTotal(
            periodLength,
            displayValue * periodLength
          );
          previousPeriodDataForGraph = generateDataForTotal(
            periodLength,
            38.2 * periodLength
          );
        } else if (timePeriod === "30d") {
          displayValue = 35.33;
          currentPeriodDataForGraph = generateDataForTotal(
            periodLength,
            displayValue * periodLength
          );
          previousPeriodDataForGraph = generateDataForTotal(
            periodLength,
            34.9 * periodLength
          );
        }
      } else {
        const startIndexCurrent = data.length - periodLength;
        const startIndexPrevious = data.length - periodLength * 2;
        currentPeriodDataForGraph = data.slice(startIndexCurrent);
        previousPeriodDataForGraph = data.slice(
          startIndexPrevious,
          startIndexCurrent
        );

        let currentPeriodSum = currentPeriodDataForGraph.reduce(
          (sum, val) => sum + val,
          0
        );
        displayValue =
          calculationType === "average"
            ? currentPeriodSum / periodLength
            : currentPeriodSum;
      }

      let currentPeriodSum = currentPeriodDataForGraph.reduce(
        (sum, val) => sum + val,
        0
      );
      let previousPeriodSum = previousPeriodDataForGraph.reduce(
        (sum, val) => sum + val,
        0
      );
      let trend = 0;
      if (previousPeriodSum !== 0) {
        trend =
          ((currentPeriodSum - previousPeriodSum) / previousPeriodSum) * 100;
      } else if (currentPeriodSum > 0) {
        trend = 100;
      }

      return {
        currentValue: displayValue,
        trend: trend,
        currentPeriodData: currentPeriodDataForGraph,
        previousPeriodData: previousPeriodDataForGraph,
      };
    },
    [timePeriod]
  );

  const recoveredRevenue = getKpiValuesFunc(
    mockKpiData.recoveredRevenue,
    "sum",
    "Recovered Revenue"
  );
  const averageCartValue = getKpiValuesFunc(
    mockKpiData.averageCartValue,
    "average",
    "Average Cart Value"
  );

  // New function to handle contact form submission using Supabase
  const handleContactSubmit = async (e) => {
    e.preventDefault();
    if (!contactEmail) return;

    setLoading(true);
    setSubmissionMessage("");
    setSubmissionError("");

    try {
      // Use the correct Supabase syntax to insert into the new 'contacts' table
      const { error } = await supabase
        .from("contacts")
        .insert({ email: contactEmail });

      if (error) {
        throw error;
      }

      setSubmissionMessage("Thank you! We will contact you soon.");
      setContactEmail("");
      // You can keep the form open or close it
      // setShowContactForm(false);
    } catch (error) {
      console.error("Error adding contact: ", error);
      setSubmissionError(
        error.message || "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-md text-center">
      <h2 className="text-4xl font-bold text-gray-900 mb-4">
        Recover more revenue. Effortlessly.
      </h2>
      <p className="text-lg text-gray-700 max-w-2xl mx-auto">
        We automatically email your customers after they abandon their cart —
        fully managed by our team, optimized for conversions. No hidden costs.
      </p>

      <div className="mt-12">
        <h3 className="text-3xl font-bold text-gray-900 mb-2">
          Proven Results Across All Stores
        </h3>
        <p className="text-lg text-gray-700 max-w-2xl mx-auto mb-8">
          Real revenue recovery data across all of our clients.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="bg-white p-6 rounded-xl shadow-md flex flex-col">
            <p className="text-4xl font-bold text-gray-900 mb-2 text-left">
              € 2883.21
            </p>
            <p className="text-lg font-medium text-gray-700 text-left">
              Average revenue recovered / month
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md flex flex-col">
            <p className="text-4xl font-bold text-gray-900 mb-2 text-left">
              12.4%
            </p>
            <p className="text-lg font-medium text-gray-700 text-left">
              Average recovery rate
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md flex flex-col">
            <p className="text-4xl font-bold text-gray-900 mb-2 text-left">
              15
            </p>
            <p className="text-lg font-medium text-gray-700 text-left">
              Average setup time (minutes)
            </p>
          </div>
        </div>

        {/* Contact Button & Form */}
        <div className="mt-6">
          {submissionMessage && (
            <div className="bg-green-100 text-green-700 px-4 py-2 mb-4 rounded">
              {submissionMessage}
            </div>
          )}
          {submissionError && (
            <div className="bg-red-100 text-red-700 px-4 py-2 mb-4 rounded">
              {submissionError}
            </div>
          )}

          {!showContactForm ? (
            <button
              onClick={() => setShowContactForm(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Get in Contact
            </button>
          ) : (
            <form
              onSubmit={handleContactSubmit}
              className="mt-4 flex flex-col items-center space-y-3"
            >
              <input
                type="email"
                placeholder="Enter your email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                required
                className="border p-2 rounded w-64"
              />
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition disabled:bg-gray-400"
              >
                {loading ? "Sending..." : "Send"}
              </button>
            </form>
          )}
        </div>

        <div className="mt-12 max-w-3xl mx-auto p-6 bg-gray-50 rounded-xl shadow-inner">
          <p className="text-lg italic text-gray-700">
            "Recoverly has been a game-changer for our online store. They take
            care of everything and we saw an immediate increase in our revenue
            coming from recovered revenue."
          </p>
          <p className="text-md font-semibold text-gray-800 mt-4">
            - Claudia, Hibou
          </p>
        </div>
      </div>

      {/* How Recoverly Works */}
      <div className="mt-16 pt-8 border-t border-gray-200">
        <h3 className="text-3xl font-bold text-gray-900 mb-6">
          How Recoverly Works
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="flex flex-col items-center p-6 bg-blue-50 rounded-xl shadow-sm">
            <div className="text-blue-600 text-5xl mb-4">🛒</div>
            <h4 className="text-xl font-semibold text-gray-800 mb-2">
              1. Cart Abandonment Detection
            </h4>
            <p className="text-gray-700 text-center">
              Our system automatically detects when a customer leaves items in
              their cart without completing a purchase.
            </p>
          </div>
          <div className="flex flex-col items-center p-6 bg-green-50 rounded-xl shadow-sm">
            <div className="text-green-600 text-5xl mb-4">📧</div>
            <h4 className="text-xl font-semibold text-gray-800 mb-2">
              2. Automated Email Campaigns
            </h4>
            <p className="text-gray-700 text-center">
              We send a series of personalized, conversion-optimized emails to
              gently remind customers and encourage them to complete their
              order.
            </p>
          </div>
          <div className="flex flex-col items-center p-6 bg-purple-50 rounded-xl shadow-sm">
            <div className="text-purple-600 text-5xl mb-4">💰</div>
            <h4 className="text-xl font-semibold text-gray-800 mb-2">
              3. Revenue Recovery
            </h4>
            <p className="text-gray-700 text-center">
              Watch your recovered revenue grow as abandoned carts are turned
              into completed sales, all managed by our expert team.
            </p>
          </div>
        </div>
      </div>

      {/* What Recoverly Offers */}
      <div className="mt-16 pt-8 border-t border-gray-200">
        <h3 className="text-3xl font-bold text-gray-900 mb-6">
          What Recoverly Offers
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto text-left">
          <div className="flex items-start p-4 bg-yellow-50 rounded-xl shadow-sm">
            <div className="text-yellow-600 text-3xl mr-4">✨</div>
            <div>
              <h4 className="text-xl font-semibold text-gray-800 mb-1">
                Fully Managed Service
              </h4>
              <p className="text-gray-700">
                Our team handles everything from email design to campaign
                optimization, so you can focus on your business.
              </p>
            </div>
          </div>
          <div className="flex items-start p-4 bg-red-50 rounded-xl shadow-sm">
            <div className="text-red-600 text-3xl mr-4">📈</div>
            <div>
              <h4 className="text-xl font-semibold text-gray-800 mb-1">
                Conversion Optimization
              </h4>
              <p className="text-gray-700">
                Emails are continuously A/B tested and refined to ensure the
                highest possible recovery rates.
              </p>
            </div>
          </div>
          <div className="flex items-start p-4 bg-teal-50 rounded-xl shadow-sm">
            <div className="text-teal-600 text-3xl mr-4">📊</div>
            <div>
              <h4 className="text-xl font-semibold text-gray-800 mb-1">
                Detailed Analytics
              </h4>
              <p className="text-gray-700">
                Access a comprehensive dashboard to track your recovered
                revenue, email performance, and more.
              </p>
            </div>
          </div>
          <div className="flex items-start p-4 bg-indigo-50 rounded-xl shadow-sm">
            <div className="text-indigo-600 text-3xl mr-4">🔒</div>
            <div>
              <h4 className="text-xl font-semibold text-gray-800 mb-1">
                Secure & Reliable
              </h4>
              <p className="text-gray-700">
                Your data and customer information are handled with the highest
                security standards.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
