import React, { useState } from 'react';

export default function ParticipantSERP() {
  const [currentStep, setCurrentStep] = useState(2);
  const totalSteps = 6;
  const [taskComplete, setTaskComplete] = useState(false);
  const [query, setQuery] = useState('hotels near dulles airport parking options');

  const progress = (currentStep / totalSteps) * 100;

  // Mock search results
  const searchResults = [
    {
      title: 'Hotels Near Dulles Airport - Official Travel Guide',
      url: 'www.dullesairporthotels.com',
      snippet: 'Find the best hotels near Washington Dulles International Airport. Compare rates for Hyatt Regency, Marriott, and Hilton properties. All hotels offer complimentary airport shuttles and are within 2 miles of the terminal. Book direct for guaranteed best rates and free cancellation.'
    },
    {
      title: 'Washington Dulles Airport Marriott | Official Site',
      url: 'www.marriott.com/hotels/dulles-airport',
      snippet: 'Located on airport property with convenient AeroTrain access to all terminals. Modern guest rooms feature premium bedding, ergonomic workspaces, and high-speed WiFi. Full-service hotel with on-site restaurant, indoor pool, and 24-hour fitness center. Starting at $189 per night with free parking for guests.'
    },
    {
      title: 'Hyatt Regency Dulles - Connected to Terminal',
      url: 'www.hyatt.com/dulles',
      snippet: 'Walk to the terminal via enclosed skybridge. No shuttle needed - direct terminal access 24/7. Premium accommodations with conference facilities and business center. Complimentary WiFi throughout. Pet-friendly rooms available. From $199 per night including breakfast buffet.'
    },
    {
      title: 'Dulles Airport Parking Options & Rates 2024',
      url: 'www.flydulles.com/parking',
      snippet: 'Official parking information for Washington Dulles International Airport. Terminal parking garages: $17/hour, $35/day. Economy parking: $10/day with free shuttle service every 10 minutes. Long-term parking available. Hourly and daily valet parking also available at main terminal.'
    },
    {
      title: 'Best Off-Airport Parking Near Dulles - TripAdvisor',
      url: 'www.tripadvisor.com/dulles-parking',
      snippet: 'Save up to 70% on airport parking with these highly-rated off-site lots. Prices starting at $7 per day with free shuttle service to terminals. Covered parking, security patrols, and online reservations available. Read 8,450 traveler reviews and compare facilities.'
    },
    {
      title: 'Hilton Washington Dulles Airport Hotel',
      url: 'www.hilton.com/dulles',
      snippet: 'Just 0.5 miles from Dulles Airport with complimentary 24-hour airport shuttle service. Recently renovated rooms with premium amenities. Indoor pool, fitness center, and on-site dining. Perfect for business and leisure travelers. Starting at $165 per night with AAA discounts available.'
    },
    {
      title: 'Park Sleep Fly Packages - Dulles Airport Hotels',
      url: 'www.airportparkinghotels.com/dulles',
      snippet: 'Special packages combining hotel stay with up to 14 days of free parking. Choose from 12 participating hotels near Dulles. Rates from $119 including one night accommodation and parking. Ideal for early morning flights or extended trips. Free shuttle to airport included.'
    },
    {
      title: 'Dulles Airport Transportation & Parking Guide',
      url: 'www.washington.org/dulles-guide',
      snippet: 'Comprehensive guide to getting to and from Washington Dulles International Airport. Information on Metro Silver Line service, hotel shuttles, rental cars, and parking facilities. Compare costs and travel times. Updated schedules and real-time parking availability.'
    }
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      
      {/* Study Navigator - Top Persistent Frame */}
      <div className="bg-card border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          
          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-medium">Study Progress</span>
              <span className="text-sm text-muted-foreground">
                Step {currentStep} of {totalSteps}
              </span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2.5">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Task Description */}
          <div className="bg-secondary/50 rounded-xl p-6 mb-6 border border-border">
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="flex-1">
                <h2 className="font-bold text-xl mb-3">
                  Task: Information Seeking about Dulles International Airport
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  You need to find comprehensive information about Washington Dulles International Airport, including: its location (city and state), available transportation options (shuttles, ride-sharing, taxis), nearby hotel accommodations, affordable off-airport parking facilities, and metro station accessibility.
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-green-500/10 border border-green-500/30 rounded-lg px-3 py-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-semibold text-green-600">Condition: Traditional Search (Bing)</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Time elapsed: 5m 18s</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => setTaskComplete(!taskComplete)}
                className={`px-8 py-3 rounded-full font-medium text-sm transition-all ${
                  taskComplete 
                    ? 'bg-green-500 text-white shadow-lg' 
                    : 'bg-secondary text-foreground hover:bg-accent border border-border'
                }`}
              >
                {taskComplete ? 'Task Marked Complete' : 'Mark Task as Complete'}
              </button>
              <button 
                disabled={!taskComplete}
                className={`px-8 py-3 rounded-full font-medium text-sm transition-all flex items-center space-x-2 ${
                  taskComplete
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl cursor-pointer'
                    : 'bg-secondary text-muted-foreground cursor-not-allowed opacity-50'
                }`}
              >
                <span>Continue to Next Step</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content Window - Traditional SERP Interface */}
      <div className="flex-1 bg-background p-6 overflow-auto">
        <div className="max-w-4xl mx-auto">
          
          {/* Search Box */}
          <div className="mb-10">
            <div className="flex items-center space-x-3">
              <div className="flex-1 flex items-center bg-card border-2 border-border focus-within:border-blue-500 rounded-2xl px-6 py-4 transition-all shadow-sm">
                <svg className="w-5 h-5 text-muted-foreground mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-sm"
                  placeholder="Search..."
                />
              </div>
              <button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-10 py-4 rounded-2xl font-medium transition-all shadow-lg hover:shadow-xl">
                Search
              </button>
            </div>
          </div>

          {/* Search Results Stats */}
          <div className="mb-8 text-sm text-muted-foreground">
            About 2,847,000 results (0.38 seconds)
          </div>

          {/* Search Results */}
          <div className="space-y-8">
            {searchResults.map((result, index) => (
              <div key={index} className="group">
                {/* URL */}
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-5 h-5 bg-secondary rounded flex items-center justify-center flex-shrink-0">
                    <svg className="w-3 h-3 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <a 
                    href={`https://${result.url}`} 
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {result.url}
                  </a>
                </div>

                {/* Title */}
                <a 
                  href={`https://${result.url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <h3 className="text-2xl text-blue-500 hover:text-blue-600 hover:underline mb-3 cursor-pointer font-medium transition-colors">
                    {result.title}
                  </h3>
                </a>

                {/* Snippet */}
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {result.snippet}
                </p>

                {/* Actions */}
                <div className="mt-3 flex items-center space-x-4">
                  <button className="text-xs text-muted-foreground hover:text-yellow-500 transition-colors flex items-center space-x-1.5">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                    <span>Mark as relevant</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="mt-16 flex justify-center items-center space-x-2">
            <button className="px-5 py-3 bg-card border border-border hover:bg-secondary rounded-xl text-sm font-medium transition-colors flex items-center space-x-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Previous</span>
            </button>
            <div className="flex space-x-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((page) => (
                <button
                  key={page}
                  className={`w-12 h-12 rounded-xl text-sm font-medium transition-all ${
                    page === 1
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md'
                      : 'bg-card border border-border hover:bg-secondary'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
            <button className="px-5 py-3 bg-card border border-border hover:bg-secondary rounded-xl text-sm font-medium transition-colors flex items-center space-x-2">
              <span>Next</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Helper Text */}
          <div className="mt-10 bg-secondary/50 border border-border rounded-xl p-6">
            <p className="text-xs text-muted-foreground text-center leading-relaxed">
              Use the search box to refine your queries. Click on result titles to explore web pages. 
              Mark results as relevant using the star button. When you have sufficient information to complete the task, 
              click "Mark Task as Complete" above.
            </p>
          </div>

        </div>
      </div>

      {/* System Info Bar */}
      <div className="bg-card border-t border-border py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center text-xs text-muted-foreground">
            <div className="flex items-center space-x-4">
              <span>Study ID: CONV-TRAD-2024</span>
              <span>•</span>
              <span>Participant: P048</span>
              <span>•</span>
              <span className="text-green-600">Session Active</span>
            </div>
            <div className="flex items-center space-x-4">
              <span>Backend: Bing Search API</span>
              <span>•</span>
              <span>Queries: 3 | Clicks: 7</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
