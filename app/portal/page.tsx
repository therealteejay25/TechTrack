'use client';

import { useState, useRef, useEffect, KeyboardEvent, ClipboardEvent } from 'react';
import { Monitor, Check, Loader2 } from 'lucide-react';
import { portalApi } from '@/lib/api';
import clsx from 'clsx';

function extractOsVersion(ua: string): string {
  if (ua.includes('Windows NT 10.0')) return 'Windows 10/11';
  if (ua.includes('Windows NT 6.3')) return 'Windows 8.1';
  if (ua.includes('Windows NT 6.2')) return 'Windows 8';
  if (ua.includes('Windows NT 6.1')) return 'Windows 7';
  if (ua.includes('Mac OS X')) {
    const match = ua.match(/Mac OS X ([0-9_]+)/);
    return match ? 'macOS ' + match[1].replace(/_/g, '.') : 'macOS';
  }
  if (ua.includes('Linux')) return 'Linux';
  if (ua.includes('Android')) {
    const match = ua.match(/Android ([0-9.]+)/);
    return match ? 'Android ' + match[1] : 'Android';
  }
  if (ua.includes('iPhone') || ua.includes('iPad')) {
    const match = ua.match(/OS ([0-9_]+)/);
    return match ? 'iOS ' + match[1].replace(/_/g, '.') : 'iOS';
  }
  return 'Unknown';
}

function getBrowserName(userAgent: string): string {
  if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) return 'Chrome';
  if (userAgent.includes('Firefox')) return 'Firefox';
  if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) return 'Safari';
  if (userAgent.includes('Edg')) return 'Edge';
  if (userAgent.includes('Opera') || userAgent.includes('OPR')) return 'Opera';
  return 'Unknown';
}

export default function PortalPage() {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1); // 1: OTP Entry, 2: Device Info, 3: Loading, 4: Confirmation
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifiedData, setVerifiedData] = useState<any>(null);
  
  // Device info form state
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [processor, setProcessor] = useState('');
  const [storage, setStorage] = useState('');
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Focus first input on mount
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleInputChange = (index: number, value: string) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

    // Auto-advance to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      // Move to previous input on backspace if current is empty
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    
    // Check if pasted data is 6 digits
    if (/^\d{6}$/.test(pastedData)) {
      const newOtp = pastedData.split('');
      setOtp(newOtp);
      setError('');
      // Focus last input
      inputRefs.current[5]?.focus();
    }
  };

  const collectSystemInfo = () => {
    const nav = navigator as any;
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    
    // Get more detailed system information
    const systemInfo = {
      // Basic system detection
      detectedOs: navigator.platform || '',
      detectedOsVersion: extractOsVersion(navigator.userAgent),
      detectedRam: nav.deviceMemory ? `${nav.deviceMemory}GB` : '',
      detectedScreenRes: `${screen.width}x${screen.height}`,
      detectedHostname: '',
      
      // Additional system info
      userAgent: navigator.userAgent,
      language: navigator.language,
      languages: navigator.languages?.join(', ') || '',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      screenColorDepth: screen.colorDepth,
      screenPixelDepth: screen.pixelDepth,
      cookieEnabled: navigator.cookieEnabled,
      onlineStatus: navigator.onLine,
      
      // Hardware info (if available)
      hardwareConcurrency: navigator.hardwareConcurrency || 0,
      maxTouchPoints: navigator.maxTouchPoints || 0,
      
      // Network info (if available)
      connectionType: connection?.effectiveType || '',
      connectionDownlink: connection?.downlink || 0,
      
      // Browser/engine detection
      browserName: getBrowserName(navigator.userAgent),
      browserVersion: getBrowserVersion(navigator.userAgent),
      
      // Additional device characteristics
      devicePixelRatio: window.devicePixelRatio || 1,
      screenOrientation: (screen as any).orientation?.type || '',
      
      // Performance info (if available)
      deviceMemory: nav.deviceMemory || 0,
      
      // Date/time info
      collectedAt: new Date().toISOString(),
      localTime: new Date().toString(),
      utcOffset: new Date().getTimezoneOffset()
    };

    return systemInfo;
  };

  const getBrowserVersion = (userAgent: string): string => {
    const match = userAgent.match(/(Chrome|Firefox|Safari|Edg|Opera|OPR)\/([0-9.]+)/);
    return match ? match[2] : '';
  };

  const handleVerify = async () => {
    const otpCode = otp.join('');
    
    if (otpCode.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Step 1: Verify OTP
      const verifyData = await portalApi.verifyOtp(otpCode);
      setVerifiedData(verifyData);

      // Step 2: Show device info form
      setStep(2);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid or expired code');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitDevice = async () => {
    if (!brand || !model || !serialNumber) {
      setError('Please fill in all required device information');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Step 3: Show loading screen
      setStep(3);

      // Collect system info and submit
      const systemInfo = collectSystemInfo();
      
      await portalApi.submit({
        otpId: verifiedData.otpId,
        otp: otp.join(''),
        brand,
        model,
        serialNumber,
        processor,
        storage,
        ...systemInfo
      });

      // Step 4: Show confirmation
      setStep(4);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to submit device information');
      setStep(2); // Go back to device info form
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <Monitor className="w-12 h-12 text-blue-600 mb-3" />
          <h1 className="text-2xl font-bold text-gray-900">TechTrack</h1>
        </div>

        {/* Step 1: OTP Entry */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Device Verification</h2>
              <p className="text-gray-600">
                Enter the 6-digit code your IT admin shared with you.
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Make sure you're on the device being assigned to you.
              </p>
            </div>

            {/* OTP Input Boxes */}
            <div className="flex justify-center space-x-2 sm:space-x-3">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => { inputRefs.current[index] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={index === 0 ? handlePaste : undefined}
                  className={clsx(
                    'w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl sm:text-3xl font-bold rounded-lg transition-all',
                    'focus:outline-none focus:ring-2 focus:ring-blue-500',
                    error
                      ? 'border-2 border-red-500 bg-red-50'
                      : 'border-2 border-gray-300 bg-white'
                  )}
                />
              ))}
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm text-center">
                {error}
              </div>
            )}

            {/* Verify Button */}
            <button
              onClick={handleVerify}
              disabled={loading || otp.some(d => !d)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-lg font-medium text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center space-x-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Verifying...</span>
                </span>
              ) : (
                'Verify'
              )}
            </button>

            <p className="text-center text-sm text-gray-500">
              Make sure you're entering the code on the device being assigned to you.
            </p>
          </div>
        )}

        {/* Step 2: Device Information Form */}
        {step === 2 && verifiedData && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Device Information</h2>
              <p className="text-gray-600">
                We've detected some information automatically. Please verify and add the missing details.
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm text-center">
                {error}
              </div>
            )}

            {/* Auto-detected info display */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-blue-900 mb-2">Auto-detected Information</h3>
              <div className="text-sm text-blue-800 space-y-1">
                <p>Operating System: {extractOsVersion(navigator.userAgent)}</p>
                <p>Screen Resolution: {screen.width}x{screen.height}</p>
                {(navigator as any).deviceMemory && (
                  <p>RAM: {(navigator as any).deviceMemory}GB</p>
                )}
                <p>Browser: {getBrowserName(navigator.userAgent)}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Brand <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Dell, HP, Lenovo, Apple..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Model <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Latitude 5420, ThinkPad X1..."
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Serial Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={serialNumber}
                  onChange={(e) => setSerialNumber(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Check device label or system settings"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Usually found on a sticker on the device or in system settings
                </p>
              </div>

              {/* Optional fields - fewer than before */}
              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Additional Information (Optional)</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Processor
                    </label>
                    <input
                      type="text"
                      value={processor}
                      onChange={(e) => setProcessor(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Intel Core i7, AMD Ryzen..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Storage
                    </label>
                    <input
                      type="text"
                      value={storage}
                      onChange={(e) => setStorage(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="256GB SSD, 1TB HDD..."
                    />
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={handleSubmitDevice}
              disabled={loading || !brand || !model || !serialNumber}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-lg font-medium text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Submitting...' : 'Submit Device Information'}
            </button>

            <p className="text-center text-xs text-gray-500">
              System information is being collected automatically to help with device management.
            </p>
          </div>
        )}

        {/* Step 3: Loading/Registering */}
        {step === 3 && (
          <div className="text-center space-y-6 py-12">
            <div className="flex justify-center">
              <Loader2 className="w-16 h-16 text-blue-600 animate-spin" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Registering device...</h2>
              <p className="text-gray-600">Please wait while we complete the verification.</p>
            </div>
          </div>
        )}

        {/* Step 4: Confirmation */}
        {step === 4 && verifiedData && (
          <div className="text-center space-y-6 py-8">
            {/* Animated Checkmark */}
            <div className="flex justify-center">
              <div className="bg-green-100 rounded-full p-6 animate-scale-in">
                <Check className="w-16 h-16 text-green-600" />
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">You're all set!</h2>
              <p className="text-gray-600">Device verification complete</p>
            </div>

            {/* Device Info */}
            <div className="bg-gray-50 rounded-xl p-6 space-y-3">
              <div>
                <p className="text-sm text-gray-600 mb-1">Device</p>
                <p className="text-xl font-bold text-gray-900">
                  {brand} {model}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Serial: {serialNumber}
                </p>
              </div>

              <div className="pt-3 border-t border-gray-200">
                <p className="text-sm text-gray-600 mb-1">Assigned to</p>
                <p className="text-lg font-medium text-gray-900">
                  {verifiedData.targetUser.name}
                </p>
                <p className="text-sm text-gray-600">{verifiedData.targetUser.email}</p>
                {verifiedData.targetUser.department && (
                  <p className="text-sm text-gray-600">{verifiedData.targetUser.department}</p>
                )}
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900">
                Your IT admin will complete the assignment on their end. You can close this window.
              </p>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes scale-in {
          from {
            transform: scale(0);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-scale-in {
          animation: scale-in 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}
