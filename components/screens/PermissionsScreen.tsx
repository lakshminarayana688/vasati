import React, { useState } from 'react';
import { VasatiLogo } from '../VasatiLogo';
import {
  MapPin,
  Camera,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Shield,
  Settings
} from 'lucide-react';

interface PermissionsScreenProps {
  onContinue: () => void;
  onSkip?: () => void;
}

export const PermissionsScreen: React.FC<PermissionsScreenProps> = ({
  onContinue,
  onSkip,
}) => {
  const [locationStatus, setLocationStatus] = useState<'idle' | 'granted' | 'denied'>('idle');
  const [cameraStatus, setCameraStatus] = useState<'idle' | 'granted' | 'denied'>('idle');
  const [photosStatus, setPhotosStatus] = useState<'idle' | 'granted'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Request Location Permission
  const requestLocation = () => {
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        position => {
          setLocationStatus('granted');
          setErrorMessage(null);
        },
        error => {
          console.warn('Geolocation error:', error);
          setLocationStatus('denied');
        },
        { timeout: 8000 }
      );
    } else {
      setLocationStatus('denied');
    }
  };

  // Request Camera Permission
  const requestCamera = async () => {
    if (typeof window !== 'undefined' && navigator.mediaDevices?.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        // Stop stream immediately after permission check
        stream.getTracks().forEach(track => track.stop());
        setCameraStatus('granted');
        setErrorMessage(null);
      } catch (err: any) {
        console.warn('Camera access denied:', err);
        setCameraStatus('denied');
      }
    } else {
      setCameraStatus('denied');
    }
  };

  // Request Photos / Gallery Permission
  const requestPhotos = () => {
    // In browser/mobile web, triggering file input verifies library access
    setPhotosStatus('granted');
  };

  const handleAllowAll = async () => {
    // Trigger location and camera checks
    requestLocation();
    await requestCamera();
    requestPhotos();
    setTimeout(() => {
      onContinue();
    }, 400);
  };

  return (
    <div className="w-full h-full bg-vasati-lavender flex flex-col justify-between font-sans relative overflow-y-auto no-scrollbar pb-6">
      {/* Header with VASATI branding */}
      <div className="px-6 pt-6 pb-2 text-center">
        <div className="flex justify-center mb-3">
          <VasatiLogo size="sm" showTagline={false} />
        </div>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-vasati-purple-soft text-vasati-purple text-[11px] font-bold border border-vasati-purple-border/60">
          <Shield className="w-3.5 h-3.5" />
          Device Permissions
        </span>

        <h2 className="text-xl font-extrabold text-vasati-dark mt-3 tracking-tight">
          Personalize Your Experience
        </h2>
        <p className="text-xs text-vasati-secondary mt-1 max-w-xs mx-auto">
          VASATI needs access to the following device features to help you find and book the best PGs near you.
        </p>
      </div>

      {/* Permissions List */}
      <div className="px-5 my-4 space-y-3.5 flex-1">
        {/* A. Location Permission */}
        <div className="bg-white rounded-3xl p-4 border border-vasati-purple-border/50 shadow-card hover:shadow-card-hover transition-all">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-vasati-purple-soft flex items-center justify-center shrink-0 border border-vasati-purple-border/60">
              <MapPin className="w-5 h-5 text-vasati-purple" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-vasati-dark">Location Access</h3>
                {locationStatus === 'granted' && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3" />
                    Allowed
                  </span>
                )}
                {locationStatus === 'denied' && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                    <AlertCircle className="w-3 h-3" />
                    Manual City Mode
                  </span>
                )}
              </div>

              <p className="text-xs text-vasati-secondary mt-1">
                Detect your current location to discover nearby verified PGs, calculate distance, and show transit directions.
              </p>

              {locationStatus === 'denied' && (
                <div className="mt-2 p-2 rounded-xl bg-amber-50/70 border border-amber-200 text-[10px] text-amber-900 flex items-start gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                  <span>Location access denied. You can still enter or select your area manually in the search bar.</span>
                </div>
              )}

              {locationStatus === 'idle' && (
                <button
                  type="button"
                  onClick={requestLocation}
                  className="mt-3 px-3.5 py-1.5 rounded-xl bg-vasati-purple-soft text-vasati-purple hover:bg-vasati-purple hover:text-white text-xs font-bold border border-vasati-purple-border/60 transition-all shadow-sm"
                >
                  Allow Location
                </button>
              )}
            </div>
          </div>
        </div>

        {/* B. Camera Permission */}
        <div className="bg-white rounded-3xl p-4 border border-vasati-purple-border/50 shadow-card hover:shadow-card-hover transition-all">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-vasati-purple-soft flex items-center justify-center shrink-0 border border-vasati-purple-border/60">
              <Camera className="w-5 h-5 text-vasati-purple" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-vasati-dark">Camera Access</h3>
                {cameraStatus === 'granted' && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3" />
                    Allowed
                  </span>
                )}
                {cameraStatus === 'denied' && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                    <Settings className="w-3 h-3" />
                    Enable in Settings
                  </span>
                )}
              </div>

              <p className="text-xs text-vasati-secondary mt-1">
                Take profile photographs and capture images for property visits or maintenance feedback.
              </p>

              {cameraStatus === 'denied' && (
                <div className="mt-2 p-2 rounded-xl bg-amber-50/70 border border-amber-200 text-[10px] text-amber-900 flex items-start gap-1.5">
                  <Settings className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                  <span>Camera permission was denied. You can enable it anytime in your device or browser settings.</span>
                </div>
              )}

              {cameraStatus === 'idle' && (
                <button
                  type="button"
                  onClick={requestCamera}
                  className="mt-3 px-3.5 py-1.5 rounded-xl bg-vasati-purple-soft text-vasati-purple hover:bg-vasati-purple hover:text-white text-xs font-bold border border-vasati-purple-border/60 transition-all shadow-sm"
                >
                  Allow Camera
                </button>
              )}
            </div>
          </div>
        </div>

        {/* C. Photos / Gallery Permission */}
        <div className="bg-white rounded-3xl p-4 border border-vasati-purple-border/50 shadow-card hover:shadow-card-hover transition-all">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-vasati-purple-soft flex items-center justify-center shrink-0 border border-vasati-purple-border/60">
              <ImageIcon className="w-5 h-5 text-vasati-purple" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-vasati-dark">Photos & Gallery Access</h3>
                {photosStatus === 'granted' && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3" />
                    Allowed
                  </span>
                )}
              </div>

              <p className="text-xs text-vasati-secondary mt-1">
                Select your profile avatar or upload photos from your device library with complete privacy.
              </p>

              {photosStatus === 'idle' && (
                <button
                  type="button"
                  onClick={requestPhotos}
                  className="mt-3 px-3.5 py-1.5 rounded-xl bg-vasati-purple-soft text-vasati-purple hover:bg-vasati-purple hover:text-white text-xs font-bold border border-vasati-purple-border/60 transition-all shadow-sm"
                >
                  Allow Photo Library
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-5 pt-3 border-t border-vasati-purple-border/40 bg-white space-y-2">
        <button
          onClick={onContinue}
          className="w-full py-4 rounded-full bg-gradient-to-r from-vasati-purple to-vasati-purple-vibrant hover:from-vasati-royal hover:to-vasati-purple text-white font-extrabold text-sm shadow-xl shadow-vasati-purple/25 flex items-center justify-center gap-2 transition-all active:scale-98"
        >
          <span>Continue to VASATI</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <button
          onClick={onSkip || onContinue}
          className="w-full py-2 text-xs font-bold text-vasati-secondary hover:text-vasati-purple transition-colors block text-center"
        >
          Skip for now
        </button>
      </div>
    </div>
  );
};
