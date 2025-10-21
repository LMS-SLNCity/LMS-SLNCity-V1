import React, { useState, useEffect } from 'react';
import { apiClient } from '../../api/client';

interface DashboardMetrics {
  totalVisits: number;
  totalRevenue: number;
  totalTests: number;
  totalClients: number;
  pendingTests: number;
  approvedTests: number;
}

interface RevenueData {
  byPaymentMode: any[];
  byClient: any[];
  dailyRevenue: any[];
}

interface TestData {
  byTemplate: any[];
  byStatus: any[];
  byCategory: any[];
}

interface ClientData {
  clients: any[];
  ledgerSummary: any[];
}

interface TrendData {
  visitsTrend: any[];
  testsTrend: any[];
  averageRevenue: any;
}

export const Dashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [revenue, setRevenue] = useState<RevenueData | null>(null);
  const [tests, setTests] = useState<TestData | null>(null);
  const [clients, setClients] = useState<ClientData | null>(null);
  const [trends, setTrends] = useState<TrendData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [metricsData, revenueData, testsData, clientsData, trendsData] = await Promise.all([
          apiClient.getDashboardOverview(),
          apiClient.getDashboardRevenue(),
          apiClient.getDashboardTests(),
          apiClient.getDashboardClients(),
          apiClient.getDashboardTrends(),
        ]);

        setMetrics(metricsData);
        setRevenue(revenueData);
        setTests(testsData);
        setClients(clientsData);
        setTrends(trendsData);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg text-gray-600">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Overview Metrics */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <MetricCard title="Total Visits" value={metrics.totalVisits} icon="📋" />
          <MetricCard title="Total Revenue" value={`₹${metrics.totalRevenue.toFixed(2)}`} icon="💰" />
          <MetricCard title="Total Tests" value={metrics.totalTests} icon="🧪" />
          <MetricCard title="B2B Clients" value={metrics.totalClients} icon="🏢" />
          <MetricCard title="Pending Tests" value={metrics.pendingTests} icon="⏳" color="orange" />
          <MetricCard title="Approved Tests" value={metrics.approvedTests} icon="✅" color="green" />
        </div>
      )}

      {/* Revenue Section */}
      {revenue && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Revenue Insights</h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Payment Mode Distribution */}
            <div>
              <h4 className="font-medium text-gray-700 mb-3">By Payment Mode</h4>
              <div className="space-y-2">
                {revenue.byPaymentMode.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="text-sm text-gray-600">{item.payment_mode || 'Unknown'}</span>
                    <span className="font-medium">₹{parseFloat(item.revenue).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Clients */}
            <div>
              <h4 className="font-medium text-gray-700 mb-3">Top B2B Clients</h4>
              <div className="space-y-2">
                {revenue.byClient.slice(0, 5).map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="text-sm text-gray-600">{item.name}</span>
                    <span className="font-medium">₹{parseFloat(item.total_revenue || 0).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tests Section */}
      {tests && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Test Analytics</h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* By Status */}
            <div>
              <h4 className="font-medium text-gray-700 mb-3">By Status</h4>
              <div className="space-y-2">
                {tests.byStatus.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="text-sm text-gray-600">{item.status}</span>
                    <span className="font-medium">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* By Category */}
            <div>
              <h4 className="font-medium text-gray-700 mb-3">By Category</h4>
              <div className="space-y-2">
                {tests.byCategory.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="text-sm text-gray-600">{item.category || 'Unknown'}</span>
                    <span className="font-medium">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Tests */}
            <div>
              <h4 className="font-medium text-gray-700 mb-3">Top Tests</h4>
              <div className="space-y-2">
                {tests.byTemplate.slice(0, 5).map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="text-sm text-gray-600">{item.name}</span>
                    <span className="font-medium">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* B2B Clients Section */}
      {clients && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">B2B Client Performance</h3>
          
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Client Name</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Visits</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Revenue</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Balance</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Pending Dues</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {clients.clients.map((client, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-sm text-gray-800">{client.name}</td>
                    <td className="px-4 py-2 text-sm text-gray-600">{client.visit_count || 0}</td>
                    <td className="px-4 py-2 text-sm text-gray-600">₹{parseFloat(client.total_revenue || 0).toFixed(2)}</td>
                    <td className="px-4 py-2 text-sm font-medium">
                      <span className={client.balance > 0 ? 'text-red-600' : 'text-green-600'}>
                        ₹{parseFloat(client.balance).toFixed(2)}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-600">₹{parseFloat(client.pending_dues || 0).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Trends Section */}
      {trends && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Business Trends (Last 30 Days)</h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Average Revenue */}
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-gray-700 mb-2">Average Revenue Per Visit</h4>
              <p className="text-2xl font-bold text-blue-600">₹{parseFloat(trends.averageRevenue.avg_revenue || 0).toFixed(2)}</p>
              <p className="text-sm text-gray-600 mt-1">Min: ₹{parseFloat(trends.averageRevenue.min_revenue || 0).toFixed(2)}</p>
              <p className="text-sm text-gray-600">Max: ₹{parseFloat(trends.averageRevenue.max_revenue || 0).toFixed(2)}</p>
            </div>

            {/* Recent Activity */}
            <div>
              <h4 className="font-medium text-gray-700 mb-3">Recent Activity</h4>
              <div className="space-y-2">
                {trends.visitsTrend.slice(-5).reverse().map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="text-sm text-gray-600">{item.date}</span>
                    <span className="font-medium">{item.count} visits</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Metric Card Component
const MetricCard: React.FC<{ title: string; value: string | number; icon: string; color?: string }> = ({
  title,
  value,
  icon,
  color = 'blue',
}) => {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200',
    orange: 'bg-orange-50 border-orange-200',
    green: 'bg-green-50 border-green-200',
  };

  return (
    <div className={`${colorClasses[color as keyof typeof colorClasses]} border rounded-lg p-6`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
        <div className="text-4xl">{icon}</div>
      </div>
    </div>
  );
};

