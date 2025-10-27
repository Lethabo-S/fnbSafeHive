import { useState, useRef, useEffect } from 'react';
import { EmergencyContact } from '../lib/supabase';
import { AlertTriangle, MapPin, CheckCircle, Phone, MessageCircle } from 'lucide-react';

type SOSButtonProps = {
  contacts: EmergencyContact[];
  userId: string;
  userName: string;
};

export function SOSButton({ contacts, userId, userName }: SOSButtonProps) {
  const [isHolding, setIsHolding] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isSending, setIsSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const holdTimerRef = useRef<number | null>(null);
  const progressTimerRef = useRef<number | null>(null);

  const HOLD_DURATION = 3000;

  useEffect(() => {
    return () => {
      if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    };
  }, []);

  const handlePressStart = () => {
    if (isSending || success) return;

    setIsHolding(true);
    setProgress(0);

    progressTimerRef.current = window.setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + (100 / (HOLD_DURATION / 50));
        return newProgress >= 100 ? 100 : newProgress;
      });
    }, 50);

    holdTimerRef.current = window.setTimeout(() => {
      triggerSOS();
    }, HOLD_DURATION);

    if (navigator.vibrate) {
      navigator.vibrate(200);
    }
  };

  const handlePressEnd = () => {
    if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
    if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    setIsHolding(false);
    setProgress(0);
  };

  const triggerSOS = async () => {
    setIsSending(true);
    setIsHolding(false);
    setProgress(100);

    if (navigator.vibrate) {
      navigator.vibrate([200, 100, 200, 100, 200]);
    }

    try {
      const position = await getCurrentPosition();
      const { latitude, longitude } = position.coords;
      const locationUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;

      const sosEvent = {
        user_id: userId,
        user_name: userName,
        latitude,
        longitude,
        location_url: locationUrl,
        timestamp: new Date().toISOString(),
        status: 'active',
      };

      const sosHistory = JSON.parse(localStorage.getItem('sos_history') || '[]');
      sosHistory.unshift(sosEvent);
      localStorage.setItem('sos_history', JSON.stringify(sosHistory.slice(0, 50)));

      sendAlertsToContacts(contacts, userName, locationUrl);

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setProgress(0);
        setIsSending(false);
      }, 3000);
    } catch (error) {
      console.error('Error triggering SOS:', error);
      alert('Failed to send SOS. Please try again or call emergency services directly.');
      setIsSending(false);
      setProgress(0);
    }
  };

  const getCurrentPosition = (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      });
    });
  };

  const sendAlertsToContacts = (contacts: EmergencyContact[], userName: string, locationUrl: string) => {
    const message = encodeURIComponent(
      `🚨 EMERGENCY ALERT 🚨\n\n${userName} needs help urgently!\n\nLocation: ${locationUrl}\n\nThis is an automated emergency message from SAFEHIVE.`
    );

    contacts.forEach((contact, index) => {
      const phoneNumber = contact.contact_phone.replace(/\D/g, '');

      setTimeout(() => {
        const telUrl = `tel:${phoneNumber}`;
        window.location.href = telUrl;

        setTimeout(() => {
          const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
          window.open(whatsappUrl, '_blank');
        }, 2000);
      }, index * 4000);
    });
  };

  const getButtonText = () => {
    if (success) return 'SOS Sent Successfully!';
    if (isSending) return 'Sending SOS...';
    if (isHolding) return 'Keep Holding...';
    return 'Hold to Send SOS';
  };

  const getButtonIcon = () => {
    if (success) return <CheckCircle className="w-16 h-16 text-white" />;
    if (isSending) return <MapPin className="w-16 h-16 text-white animate-pulse" />;
    return <AlertTriangle className="w-16 h-16 text-white" />;
  };

  if (contacts.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-8 h-8 text-yellow-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">No Emergency Contacts</h3>
        <p className="text-gray-600 mb-4">
          Please add at least one emergency contact before using the SOS feature.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Emergency SOS</h2>
        <p className="text-gray-600">Hold the button for 3 seconds to send alert</p>
      </div>

      <div className="flex flex-col items-center">
        <div className="relative">
          <button
            onMouseDown={handlePressStart}
            onMouseUp={handlePressEnd}
            onMouseLeave={handlePressEnd}
            onTouchStart={handlePressStart}
            onTouchEnd={handlePressEnd}
            disabled={isSending}
            className={`
              relative w-64 h-64 rounded-full font-bold text-white text-xl
              transition-all duration-200 select-none
              ${success ? 'bg-green-600' : 'bg-red-600 hover:bg-red-700 active:scale-95'}
              ${isSending ? 'opacity-75 cursor-wait' : 'cursor-pointer'}
              ${isHolding ? 'scale-95' : ''}
              disabled:cursor-not-allowed
              shadow-2xl
            `}
            style={{
              background: success
                ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                : isHolding
                ? 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)'
                : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            }}
          >
            <div className="absolute inset-0 rounded-full overflow-hidden">
              {isHolding && (
                <div
                  className="absolute bottom-0 left-0 right-0 bg-white bg-opacity-30 transition-all duration-100"
                  style={{ height: `${progress}%` }}
                />
              )}
            </div>

            <div className="relative z-10 flex flex-col items-center justify-center h-full">
              {getButtonIcon()}
              <span className="mt-4 px-4">{getButtonText()}</span>
            </div>
          </button>
        </div>

        <div className="mt-8 text-center max-w-md space-y-4">
          <p className="text-sm text-gray-600">
            Your location and emergency alert will be sent to {contacts.length} contact
            {contacts.length !== 1 ? 's' : ''}.
          </p>
          <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-red-600" />
              <span>Call</span>
            </div>
            <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
            <div className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-green-600" />
              <span>WhatsApp</span>
            </div>
          </div>
          <p className="text-xs text-gray-500">
            Works completely offline with local storage
          </p>
        </div>
      </div>
    </div>
  );
}
