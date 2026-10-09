import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { LandingPage } from './pages/LandingPage';
import { FindParkingPage } from './pages/FindParkingPage';
import { CheckInPage } from './pages/CheckInPage';
import { MyParkingPage } from './pages/MyParkingPage';
import { AdminPage } from './pages/AdminPage';
import { HowItWorksPage } from './pages/HowItWorksPage';
import { QRScannerModal } from './components/QRScannerModal';
import { PaymentModal } from './components/PaymentModal';
import { ReceiptView } from './components/ReceiptView';
import { ParkingLocation, ParkingSession, ReceiptData } from './types';
import { fetchLocations } from './services/api';
import { RefreshCw, AlertCircle } from 'lucide-react';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('landing');
  const [locations, setLocations] = useState<ParkingLocation[]>([]);
  const [loadingLocations, setLoadingLocations] = useState<boolean>(true);
  const [locationsError, setLocationsError] = useState<string | null>(null);

  // Flow State
  const [selectedLocation, setSelectedLocation] = useState<ParkingLocation | null>(null);
  const [isQRScannerOpen, setIsQRScannerOpen] = useState<boolean>(false);
  const [activeSessionForPayment, setActiveSessionForPayment] = useState<ParkingSession | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState<boolean>(false);
  const [currentReceipt, setCurrentReceipt] = useState<ReceiptData | null>(null);

  useEffect(() => {
    loadLocationsData();
  }, []);

  const loadLocationsData = async () => {
    setLoadingLocations(true);
    setLocationsError(null);
    try {
      const data = await fetchLocations();
      setLocations(data);
      if (data.length > 0 && !selectedLocation) {
        setSelectedLocation(data[0]);
      }
    } catch (err: any) {
      setLocationsError(err.message || 'Unable to connect to OlivePark API');
    } finally {
      setLoadingLocations(false);
    }
  };

  // Handlers
  const handleSelectLocationFromCard = (loc: ParkingLocation) => {
    setSelectedLocation(loc);
    setActiveTab('check-in');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleQRScanSuccess = (loc: ParkingLocation) => {
    setSelectedLocation(loc);
    setIsQRScannerOpen(false);
    setActiveTab('check-in');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleProceedToPayment = (session: ParkingSession) => {
    setActiveSessionForPayment(session);
    setIsPaymentModalOpen(true);
  };

  const handlePaymentSuccess = (receipt: ReceiptData) => {
    setIsPaymentModalOpen(false);
    setActiveSessionForPayment(null);
    setCurrentReceipt(receipt);
    setActiveTab('receipt');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewReceiptFromHistory = (receipt: ReceiptData) => {
    setCurrentReceipt(receipt);
    setActiveTab('receipt');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F5EA] text-[#30372A]">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenQRScanner={() => setIsQRScannerOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {loadingLocations ? (
          <div className="py-24 text-center space-y-3">
            <RefreshCw className="w-6 h-6 text-[#7B8450] animate-spin mx-auto" />
            <p className="text-xs font-semibold text-[#666D57]">
              Loading Solapur Parking Facilities...
            </p>
          </div>
        ) : locationsError ? (
          <div className="max-w-md mx-auto my-16 p-6 rounded-2xl bg-red-50 border border-red-200 text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-red-600 mx-auto" />
            <h3 className="font-bold text-red-900 text-sm">Backend Service Connection Error</h3>
            <p className="text-xs text-red-700">{locationsError}</p>
            <button
              onClick={loadLocationsData}
              className="bg-[#7B8450] text-[#FFFDF6] px-4 py-2 rounded-xl text-xs font-bold"
            >
              Retry Connection
            </button>
          </div>
        ) : (
          <>
            {activeTab === 'landing' && (
              <LandingPage
                locations={locations}
                onSelectLocation={handleSelectLocationFromCard}
                onOpenQR={(loc) => {
                  if (loc) setSelectedLocation(loc);
                  setIsQRScannerOpen(true);
                }}
                onNavigate={(tab) => {
                  setActiveTab(tab);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            )}

            {activeTab === 'find-parking' && (
              <FindParkingPage
                locations={locations}
                onSelectLocation={handleSelectLocationFromCard}
                onOpenQR={(loc) => {
                  if (loc) setSelectedLocation(loc);
                  setIsQRScannerOpen(true);
                }}
              />
            )}

            {activeTab === 'check-in' && (
              <CheckInPage
                selectedLocation={selectedLocation}
                allLocations={locations}
                onLocationChange={(loc) => setSelectedLocation(loc)}
                onProceedToPayment={handleProceedToPayment}
                onBackToLocations={() => setActiveTab('find-parking')}
              />
            )}

            {activeTab === 'my-parking' && (
              <MyParkingPage
                onViewReceipt={handleViewReceiptFromHistory}
                onNewBooking={() => {
                  setActiveTab('find-parking');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            )}

            {activeTab === 'admin' && <AdminPage />}

            {activeTab === 'how-it-works' && (
              <HowItWorksPage
                onStartBooking={() => {
                  setActiveTab('find-parking');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            )}

            {activeTab === 'receipt' && currentReceipt && (
              <ReceiptView
                receipt={currentReceipt}
                onBackToHistory={() => {
                  setActiveTab('my-parking');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onNewBooking={() => {
                  setActiveTab('find-parking');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            )}
          </>
        )}
      </main>

      {/* Global Modals */}
      <QRScannerModal
        isOpen={isQRScannerOpen}
        onClose={() => setIsQRScannerOpen(false)}
        onSuccess={handleQRScanSuccess}
      />

      {activeSessionForPayment && (
        <PaymentModal
          isOpen={isPaymentModalOpen}
          session={activeSessionForPayment}
          onClose={() => setIsPaymentModalOpen(false)}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}

      {/* Global Footer */}
      <Footer setActiveTab={(tab) => {
        setActiveTab(tab);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }} />
    </div>
  );
};

export default App;
