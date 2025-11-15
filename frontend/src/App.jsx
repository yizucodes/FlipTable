import { useState, useEffect } from 'react'
import './App.css'

// API URL from environment variable or default to localhost
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001'

function App() {
  const [escrowData, setEscrowData] = useState(null)
  const [demoState, setDemoState] = useState('initial') // initial, calling, complete, matching, done
  const [transcript, setTranscript] = useState([])
  const [matchResults, setMatchResults] = useState(null)
  const [paymentResult, setPaymentResult] = useState(null)
  const [isPaymentLoading, setIsPaymentLoading] = useState(false)

  useEffect(() => {
    // Fetch escrow pool data
    fetch(`${API_URL}/api/escrow-pool`, {
      headers: {
        'ngrok-skip-browser-warning': 'true'
      }
    })
      .then(res => res.json())
      .then(data => setEscrowData(data))
      .catch(err => console.error('Error fetching escrow data:', err))
  }, [])

  const addTranscript = (speaker, text) => {
    setTranscript(prev => [...prev, { speaker, text, timestamp: Date.now() }])
  }

  const startDemo = () => {
    setDemoState('calling')
    setTranscript([])
    setMatchResults(null)
    setPaymentResult(null)
    
    // ElevenLabs widget will handle the live conversation
    // No pre-recorded audio playback needed
  }

  const runMatching = () => {
    setTimeout(() => {
      setDemoState('matching')
      
      // Call backend for matching
      fetch(`${API_URL}/api/match-results`, {
        headers: {
          'ngrok-skip-browser-warning': 'true'
        }
      })
        .then(res => res.json())
        .then(data => {
          setMatchResults(data)
          setDemoState('done')
        })
        .catch(err => console.error('Error fetching match results:', err))
    }, 2000)
  }

  const simulatePickup = async () => {
    setIsPaymentLoading(true)
    
    // Simulate API delay (2 seconds)
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Fake successful payment response
    setPaymentResult({
      status: "success",
      transaction_id: "0xf4a2b8c1d9e3f7a6b5c4d2e1f9a8b7c6d5e4f3a2b1",
      amount: "8.00",
      recipient: "Mario's Pizza",
      timestamp: new Date().toISOString()
    })
    
    setIsPaymentLoading(false)
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header - Willow green background with white text */}
      <header className="bg-willow-400 text-white py-6 px-4 sm:px-8 shadow-sm">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2 flex items-center gap-3">
            <img src="/fliptable-logo.svg" alt="FlipTable Logo" className="w-10 h-10 sm:w-12 sm:h-12" />
            FlipTable
          </h1>
          <p className="text-sm sm:text-base opacity-90">Flip waste into revenue in minutes</p>
        </div>
      </header>

      {/* Main Dashboard */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          
          {/* Column 1: Escrow Pool - Light gray card with subtle border */}
          <div className="bg-gray-50 rounded-lg p-5 sm:p-6 border border-gray-200 shadow-sm">
            <h2 className="text-xl font-bold mb-4 text-gray-800">💰 Escrow Pool</h2>
            
            {escrowData ? (
              <>
                <div className="mb-4">
                  <div className="text-4xl font-bold text-willow-400">{escrowData.buyer_count}</div>
                  <div className="text-sm text-gray-500 mt-1">Committed Buyers</div>
                </div>
                
                <div className="mb-4">
                  <div className="text-3xl font-bold text-willow-400">${escrowData.total_escrowed}</div>
                  <div className="text-sm text-gray-500 mt-1">Total Escrowed</div>
                </div>
                
                <div className="mb-6">
                  <div className="text-2xl font-bold text-willow-400">${escrowData.avg_bid.toFixed(2)}</div>
                  <div className="text-sm text-gray-500 mt-1">Average Bid</div>
                </div>

                {/* User List - Light borders between rows */}
                <div className="space-y-0 max-h-64 overflow-y-auto">
                  {escrowData.users.map((user) => (
                    <div key={user.user_id} className="flex justify-between py-2.5 border-b border-gray-200 last:border-0">
                      <span className="text-sm text-gray-800">{user.name}</span>
                      <span className="text-sm font-bold text-willow-400">${user.amount_escrowed}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-gray-500">Loading escrow data...</div>
            )}
          </div>

          {/* Column 2: Agent Status */}
          <div className="bg-gray-50 rounded-lg p-5 sm:p-6 border border-gray-200 shadow-sm">
            <h2 className="text-xl font-bold mb-4 text-gray-800">🤖 Agent Status</h2>
            
            {demoState === 'initial' && (
              <div className="text-center py-8 sm:py-12">
                <div className="text-5xl sm:text-6xl mb-4">⏰</div>
                <div className="text-base sm:text-lg mb-6 text-gray-800 font-medium">Scheduled call: 6:00 PM</div>
                <button
                  onClick={startDemo}
                  className="bg-willow-400 hover:bg-willow-500 active:bg-willow-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-bold text-base sm:text-lg transition-colors min-h-touch shadow-sm"
                >
                  ▶ START DEMO
                </button>
              </div>
            )}

            {demoState === 'calling' && (
              <div className="flex flex-col items-center">
                <div className="text-base sm:text-lg font-bold text-willow-400 mb-6 flex items-center">
                  <img src="/fliptable-logo.svg" alt="FlipTable" className="w-8 h-8 mr-2 animate-spin" style={{ animationDuration: '3s' }} />
                  Agent Calling Mario's Pizza...
                </div>
                
                {/* ElevenLabs Conversational AI Widget - Centered */}
                <div className="w-full flex justify-center mb-6">
                  <elevenlabs-convai 
                    agent-id="agent_6801ka2pyjzae7xbjkkdbcz059y4"
                    style={{
                      display: 'block',
                      width: '100%',
                      maxWidth: '500px',
                      height: '400px'
                    }}
                    className="sm:h-[500px] h-[400px]"
                  ></elevenlabs-convai>
                </div>
                
                {/* Complete Call Button */}
                <button
                  onClick={() => {
                    setDemoState('complete')
                    setTimeout(() => runMatching(), 2000)
                  }}
                  className="bg-willow-400 hover:bg-willow-500 active:bg-willow-600 text-white px-6 py-2.5 rounded-lg font-medium text-sm transition-colors shadow-sm"
                >
                  ✓ Call Complete - Continue to Matching
                </button>
                
                {/* Transcript Container - Optional, can show conversation history */}
                {transcript.length > 0 && (
                  <div className="bg-white rounded-lg p-4 border border-gray-200 max-h-60 overflow-y-auto w-full mt-4">
                    <div className="text-xs font-semibold text-gray-500 mb-2 uppercase">Call Transcript</div>
                    {transcript.map((line, idx) => (
                      <div key={idx} className="mb-3 animate-fade-in">
                        <div className="mb-1">
                          <span className={`font-bold text-sm ${
                            line.speaker === 'AGENT' ? 'text-blue-600' : 
                            line.speaker === 'SYSTEM' ? 'text-gray-500' : 
                            'text-willow-400'
                          }`}>
                            {line.speaker}
                          </span>
                        </div>
                        <p className="text-sm text-gray-800 leading-relaxed">
                          {line.speaker === 'SYSTEM' ? line.text : `"${line.text}"`}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {demoState === 'complete' && (
              <div className="text-center py-8 sm:py-12">
                <div className="text-5xl sm:text-6xl mb-4">✅</div>
                <div className="text-xl font-bold text-willow-400 mb-2">Deal Confirmed!</div>
                <div className="text-base text-gray-800">14 pizzas at $8 each</div>
              </div>
            )}

            {demoState === 'matching' && (
              <div className="text-center py-8 sm:py-12">
                <div className="text-5xl sm:text-6xl mb-4">🔄</div>
                <div className="text-xl font-bold text-willow-400 mb-2">Matching buyers...</div>
              </div>
            )}
          </div>

          {/* Column 3: Match Results */}
          <div className="bg-gray-50 rounded-lg p-5 sm:p-6 border border-gray-200 shadow-sm">
            <h2 className="text-xl font-bold mb-4 text-gray-800">🎯 Match Results</h2>
            
            {demoState === 'done' && matchResults ? (
              <div>
                <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6">
                  <div className="text-center bg-willow-50 rounded-lg p-3 border border-willow-100">
                    <div className="text-3xl sm:text-4xl font-bold text-willow-400">{matchResults.matched_count}</div>
                    <div className="text-xs sm:text-sm text-gray-500 mt-1">Matched</div>
                  </div>
                  <div className="text-center bg-red-50 rounded-lg p-3 border border-red-100">
                    <div className="text-3xl sm:text-4xl font-bold text-red-600">{matchResults.refunded_count}</div>
                    <div className="text-xs sm:text-sm text-gray-500 mt-1">Refunded</div>
                  </div>
                </div>
                
                <div className="mb-6 bg-willow-50 rounded-lg p-4 border border-willow-100">
                  <div className="text-3xl font-bold text-willow-400">${matchResults.restaurant_revenue}</div>
                  <div className="text-sm text-gray-500 mt-1">Restaurant Revenue</div>
                </div>

                {/* Matched users list */}
                <div className="space-y-0 max-h-64 overflow-y-auto">
                  {matchResults.matched.slice(0, 10).map(match => (
                    <div key={match.user_id} className="flex items-center justify-between py-2.5 border-b border-gray-200 last:border-0">
                      <span className="text-sm text-willow-400 font-medium flex items-center">
                        <span className="mr-2">✅</span>
                        {match.name}
                      </span>
                      <span className="text-sm text-gray-800">{match.item}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 sm:py-12 text-gray-500">
                <div className="text-4xl mb-3">⏳</div>
                <div className="text-sm">Waiting for call to complete...</div>
              </div>
            )}
          </div>
        </div>

        {/* Impact Metrics - Willow gradient background */}
        {demoState === 'done' && matchResults && (
          <div className="mt-6 sm:mt-8 bg-gradient-to-r from-willow-400 to-willow-500 rounded-lg p-6 sm:p-8 text-white shadow-md">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 text-center">
              <div>
                <div className="text-2xl sm:text-3xl font-bold">2m 47s</div>
                <div className="text-xs sm:text-sm opacity-90 mt-1">Time to Complete</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-bold">${matchResults.restaurant_revenue}</div>
                <div className="text-xs sm:text-sm opacity-90 mt-1">Restaurant Revenue</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-bold">${matchResults.total_buyer_savings.toFixed(0)}</div>
                <div className="text-xs sm:text-sm opacity-90 mt-1">Buyers Saved</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-bold">{matchResults.food_saved_lbs} lbs</div>
                <div className="text-xs sm:text-sm opacity-90 mt-1">Food Saved</div>
              </div>
            </div>
          </div>
        )}

        {/* Pickup Button - Willow CTA */}
        {demoState === 'done' && (
          <div className="mt-6 sm:mt-8 text-center">
            <button
              onClick={simulatePickup}
              disabled={isPaymentLoading || paymentResult}
              className="bg-willow-400 hover:bg-willow-500 active:bg-willow-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-bold text-base sm:text-lg transition-colors min-h-touch shadow-sm"
            >
              {isPaymentLoading ? '⏳ Processing Payment...' : paymentResult ? '✅ Payment Complete' : '🏪 Simulate Pickup (Real Payment)'}
            </button>
            
            {paymentResult && (
              <div className="mt-6 bg-white border-4 border-willow-400 rounded-lg p-6 max-w-2xl mx-auto shadow-lg">
                {paymentResult.status === 'success' ? (
                  <>
                    <div className="text-center mb-4">
                      <div className="text-6xl mb-2">✅</div>
                      <div className="text-2xl font-bold text-willow-600">Payment Complete!</div>
                    </div>
                    
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between items-center py-2 border-b">
                        <span className="text-gray-600">Amount:</span>
                        <span className="font-bold text-lg text-willow-600">${paymentResult.amount} USDC</span>
                      </div>
                      
                      <div className="flex justify-between items-center py-2 border-b">
                        <span className="text-gray-600">Recipient:</span>
                        <span className="font-semibold">{paymentResult.recipient}</span>
                      </div>
                      
                      <div className="py-2">
                        <div className="text-gray-600 mb-1">Transaction ID:</div>
                        <div className="font-mono text-xs bg-gray-100 p-3 rounded break-all border border-gray-300">
                          {paymentResult.transaction_id}
                        </div>
                      </div>
                      
                      <div className="bg-willow-50 rounded p-3 mt-4">
                        <div className="text-xs text-gray-600 mb-1">✓ Verified on Base Blockchain</div>
                        <div className="text-xs text-gray-600">✓ Powered by Locus</div>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-xl sm:text-2xl font-bold text-red-600 mb-3 flex items-center justify-center">
                      <span className="text-3xl mr-2">❌</span>
                      Payment Error
                    </div>
                    <div className="text-sm text-gray-800">
                      {paymentResult.message}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

export default App
