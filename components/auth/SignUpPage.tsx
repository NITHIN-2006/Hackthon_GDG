import React, { useState, useEffect, useRef } from 'react';
import { UserData, UserRole, PendingAidmate, AidmateProfile } from '../../types';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { Shield, CheckCircle, Lock, Key, AlertCircle, Eye, EyeOff, User, Wrench, Upload, FileCheck, Award, X, LogIn, UserPlus } from 'lucide-react';
import { ADMIN_CREDENTIALS } from '../../constants';

interface SignUpPageProps {
  onSignUpSuccess: (data: UserData, role?: UserRole) => void;
  onAdminLogin?: () => void;
  onRegisterAidmatePending?: (pendingData: PendingAidmate) => void;
  verifiedAidmates?: AidmateProfile[];
}

const SignUpPage: React.FC<SignUpPageProps> = ({ 
  onSignUpSuccess, 
  onAdminLogin, 
  onRegisterAidmatePending,
  verifiedAidmates = []
}) => {
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [isFormValid, setIsFormValid] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  // Main Tabs: 'user' | 'aidmate' | 'admin'
  const [activeTab, setActiveTab] = useState<'user' | 'aidmate' | 'admin'>('user');
  
  // AidMate sub-mode: 'login' (returning AidMate) vs 'register' (new AidMate with certificate)
  const [aidmateMode, setAidmateMode] = useState<'login' | 'register'>('login');

  // AidMate Registration specific states
  const [aidmateSkill, setAidmateSkill] = useState('Plumbing');
  const [experienceYears, setExperienceYears] = useState('3');
  const [certificateName, setCertificateName] = useState('');
  const [certificateFile, setCertificateFile] = useState<File | null>(null);
  const [certificatePreview, setCertificatePreview] = useState<string | null>(null);
  const [certificateType, setCertificateType] = useState('Trade Certificate / ITI / Government Certification');
  const [isSubmittedForVerification, setIsSubmittedForVerification] = useState(false);

  // Admin credentials state
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [adminError, setAdminError] = useState('');
  const [isAdminAuthenticating, setIsAdminAuthenticating] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (activeTab === 'admin') {
      setIsFormValid(adminUsername.trim().length > 0 && adminPassword.length > 0);
    } else if (activeTab === 'aidmate' && aidmateMode === 'login') {
      const isMobileValid = /^\d{10}$/.test(mobile);
      setIsFormValid(isMobileValid);
    } else {
      const isMobileValid = /^\d{10}$/.test(mobile);
      setIsFormValid(name.trim().length > 2 && isMobileValid);
    }
  }, [name, mobile, activeTab, aidmateMode, adminUsername, adminPassword]);

  const handleMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 10) {
      setMobile(value);
    }
  };

  const handleCertificateUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCertificateFile(file);
      setCertificateName(file.name);

      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        setCertificatePreview(uploadEvent.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeCertificate = () => {
    setCertificateFile(null);
    setCertificateName('');
    setCertificatePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setIsVerified(true);
      setTimeout(() => {
        onSignUpSuccess({ 
          name, 
          mobile,
          overallRating: 5.0,
          reviewCount: 1,
          ratings: { '5': 1, '4': 0, '3': 0, '2': 0, '1': 0 }
        }, 'seeker');
      }, 1000);
    }, 1200);
  };

  // RETURNING AIDMATE LOGIN (Fast Mobile OTP Login)
  const handleAidmateLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setIsVerified(true);
      
      // Look up existing AidMate if registered, or initialize profile
      const existing = verifiedAidmates.find(a => a.mobile === mobile);
      const aidmateName = existing ? existing.name : (name.trim() || 'AidMate Professional');

      setTimeout(() => {
        onSignUpSuccess({ 
          name: aidmateName, 
          mobile,
          overallRating: existing?.overallRating || 5.0,
          reviewCount: existing?.reviewCount || 1,
          ratings: existing?.ratings || { '5': 1, '4': 0, '3': 0, '2': 0, '1': 0 }
        }, 'provider');
      }, 1000);
    }, 1200);
  };

  // NEW AIDMATE REGISTRATION WITH CERTIFICATE
  const handleAidmateRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    setIsVerifying(true);

    setTimeout(() => {
      setIsVerifying(false);

      const newPendingAidmate: PendingAidmate = {
        id: `pending-${Date.now()}`,
        name,
        mobile,
        providerType: 'professional',
        submissionDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        profilePictureUrl: `https://api.dicebear.com/7.x/notionists/svg?seed=${name}`,
        documents: {
          aadhaarFrontUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=400&q=80',
          aadhaarBackUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=400&q=80',
          selfieVideoUrl: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4',
          certificateUrl: certificatePreview || 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=600&q=80',
          bankPassbookUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=400&q=80'
        }
      };

      if (onRegisterAidmatePending) {
        onRegisterAidmatePending(newPendingAidmate);
      }

      setIsSubmittedForVerification(true);
    }, 1200);
  };

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError('');

    if (
      adminUsername.trim() !== ADMIN_CREDENTIALS.username ||
      adminPassword !== ADMIN_CREDENTIALS.password
    ) {
      setAdminError('Invalid administrator username or password. Access denied.');
      return;
    }

    setIsAdminAuthenticating(true);
    setTimeout(() => {
      setIsAdminAuthenticating(false);
      if (onAdminLogin) {
        onAdminLogin();
      } else {
        onSignUpSuccess({ name: 'System Administrator', mobile: '9999999999' }, 'admin');
      }
    }, 800);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[85vh] px-4 font-sans">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-indigo-600 rounded-3xl mx-auto flex items-center justify-center text-white font-black text-3xl shadow-xl mb-3">
          A
        </div>
        <h1 className="text-4xl font-black text-gray-900 tracking-tight">AIDO</h1>
        <p className="text-gray-500 tracking-widest text-xs font-bold mt-1 uppercase">People For People</p>
      </div>
      
      {isSubmittedForVerification ? (
        /* SUCCESSFUL AIDMATE SUBMISSION WITH CERTIFICATE */
        <div className="w-full max-w-sm bg-white p-7 rounded-3xl shadow-xl border border-gray-100 text-center animate-in zoom-in-95 duration-200">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mx-auto mb-3 shadow-sm">
            <FileCheck className="w-9 h-9" />
          </div>
          <h2 className="text-xl font-black text-gray-900 mb-1">Registration Complete!</h2>
          <p className="text-xs text-gray-600 mb-4">
            Your AidMate profile & trade certificate have been registered. You can now log in anytime with your phone number <strong>+91 {mobile}</strong>.
          </p>

          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-3.5 text-left text-xs mb-5 space-y-1.5">
            <p className="flex justify-between">
              <span className="text-gray-500">Registered Name:</span>
              <strong className="text-gray-900">{name}</strong>
            </p>
            <p className="flex justify-between">
              <span className="text-gray-500">Registered Mobile:</span>
              <strong className="text-gray-900">+91 {mobile}</strong>
            </p>
            <p className="flex justify-between">
              <span className="text-gray-500">Trade Skill:</span>
              <strong className="text-emerald-700">{aidmateSkill}</strong>
            </p>
            <p className="flex justify-between">
              <span className="text-gray-500">Certificate:</span>
              <strong className="text-gray-900 truncate max-w-[150px]">
                {certificateName || 'Provided'}
              </strong>
            </p>
            <p className="flex justify-between">
              <span className="text-gray-500">Admin Review:</span>
              <span className="text-amber-700 font-bold bg-amber-100 px-2 py-0.5 rounded-full text-[10px]">
                Queued for Verification
              </span>
            </p>
          </div>

          <div className="space-y-2">
            <button
              onClick={() => {
                onSignUpSuccess({ 
                  name, 
                  mobile,
                  overallRating: 5.0,
                  reviewCount: 1,
                  ratings: { '5': 1, '4': 0, '3': 0, '2': 0, '1': 0 }
                }, 'provider');
              }}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-2xl transition-all shadow-md flex items-center justify-center gap-1.5"
            >
              <LogIn className="w-4 h-4" /> Enter AidMate Dashboard
            </button>
            <button
              onClick={() => {
                setIsSubmittedForVerification(false);
                setAidmateMode('login');
              }}
              className="w-full py-2.5 text-xs text-gray-500 hover:text-gray-700 font-bold"
            >
              Go to AidMate Login
            </button>
          </div>
        </div>
      ) : isVerified ? (
        <div className="flex flex-col items-center justify-center animate-in zoom-in-95 duration-200">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-3 shadow-sm">
            <CheckCircle className="w-12 h-12" />
          </div>
          <p className="text-lg font-extrabold text-gray-800">
            {activeTab === 'aidmate' ? 'AidMate Verified' : 'User Verified'}
          </p>
          <p className="text-xs text-gray-500 mt-1">Entering your dashboard...</p>
        </div>
      ) : (
        <div className="w-full max-w-sm bg-white p-6 sm:p-7 rounded-3xl shadow-xl border border-gray-100">
          {/* Main Role Tabs */}
          <div className="flex border-b border-gray-100 mb-5">
            <button
              type="button"
              onClick={() => {
                setActiveTab('user');
                setAdminError('');
              }}
              className={`flex-1 pb-3 text-xs sm:text-sm font-extrabold border-b-2 transition-colors flex items-center justify-center gap-1 ${
                activeTab === 'user' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>User Login</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('aidmate');
                setAdminError('');
              }}
              className={`flex-1 pb-3 text-xs sm:text-sm font-extrabold border-b-2 transition-colors flex items-center justify-center gap-1 ${
                activeTab === 'aidmate' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>AidMate Portal</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('admin');
                setAdminError('');
              }}
              className={`pb-3 px-2 text-xs sm:text-sm font-extrabold border-b-2 transition-colors flex items-center justify-center gap-1 ${
                activeTab === 'admin' ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Admin</span>
            </button>
          </div>

          {activeTab === 'user' && (
            /* USER / CUSTOMER LOGIN */
            <form onSubmit={handleUserSubmit} className="space-y-4">
              <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-3 text-xs text-indigo-900 mb-2">
                <p className="font-bold flex items-center gap-1.5 text-indigo-950">
                  <User className="w-3.5 h-3.5 text-indigo-600" /> Community User Portal
                </p>
                <p className="text-[11px] text-indigo-700/90 mt-0.5">
                  Request tasks, track nearby AidMates on OpenStreetMap, and rate your service.
                </p>
              </div>

              <Input
                id="name"
                label="Full Name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ramesh Kumar"
                required
              />
              <div className="space-y-1">
                <Input
                  id="mobile"
                  label="Mobile Number"
                  type="tel"
                  prefix="+91"
                  value={mobile}
                  onChange={handleMobileChange}
                  required
                  pattern="\d{10}"
                  title="Mobile number must be 10 digits"
                  placeholder="9876543210"
                />
                <p className="text-[11px] text-gray-400 text-center">SIM must be active in device</p>
              </div>

              <Button type="submit" disabled={!isFormValid} isLoading={isVerifying} className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700">
                Login as User
              </Button>
            </form>
          )}

          {activeTab === 'aidmate' && (
            <div className="space-y-4">
              {/* AidMate Sub-navigation: Quick Login vs New Registration */}
              <div className="bg-gray-100 p-1 rounded-2xl flex text-xs font-bold mb-2">
                <button
                  type="button"
                  onClick={() => setAidmateMode('login')}
                  className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                    aidmateMode === 'login'
                      ? 'bg-white text-emerald-800 shadow-sm'
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Existing AidMate Login</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAidmateMode('register')}
                  className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                    aidmateMode === 'register'
                      ? 'bg-white text-emerald-800 shadow-sm'
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Register with Certificate</span>
                </button>
              </div>

              {aidmateMode === 'login' ? (
                /* RETURNING AIDMATE LOGIN */
                <form onSubmit={handleAidmateLoginSubmit} className="space-y-4">
                  <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-3 text-xs text-emerald-900">
                    <p className="font-bold flex items-center gap-1.5 text-emerald-950">
                      <LogIn className="w-3.5 h-3.5 text-emerald-600" /> Log In with Registered Number
                    </p>
                    <p className="text-[11px] text-emerald-700/90 mt-0.5">
                      Enter your mobile number to resume your active AidMate status, view accepted jobs, and check your ratings.
                    </p>
                  </div>

                  <div className="space-y-1">
                    <Input
                      id="registered-aidmate-mobile"
                      label="Registered Mobile Number"
                      type="tel"
                      prefix="+91"
                      value={mobile}
                      onChange={handleMobileChange}
                      required
                      pattern="\d{10}"
                      title="Mobile number must be 10 digits"
                      placeholder="9876543210"
                    />
                    <p className="text-[11px] text-gray-400 text-center">Instant OTP verification</p>
                  </div>

                  <Button type="submit" disabled={!isFormValid} isLoading={isVerifying} className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 flex items-center justify-center gap-1.5">
                    <LogIn className="w-4 h-4" />
                    <span>Login to AidMate Account</span>
                  </Button>

                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={() => setAidmateMode('register')}
                      className="text-xs text-emerald-700 font-bold hover:underline"
                    >
                      New AidMate? Register & submit certificate &rarr;
                    </button>
                  </div>
                </form>
              ) : (
                /* NEW AIDMATE REGISTRATION WITH CERTIFICATE UPLOAD */
                <form onSubmit={handleAidmateRegisterSubmit} className="space-y-4">
                  <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-3 text-xs text-emerald-900">
                    <p className="font-bold flex items-center gap-1.5 text-emerald-950">
                      <Award className="w-4 h-4 text-emerald-600" /> Register as Certified AidMate
                    </p>
                    <p className="text-[11px] text-emerald-700/90 mt-0.5">
                      Upload your professional trade certificate so the Admin can verify your skills.
                    </p>
                  </div>

                  <Input
                    id="aidmate-name"
                    label="Full Name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Suresh Varma"
                    required
                  />

                  <div className="space-y-1">
                    <Input
                      id="aidmate-mobile"
                      label="Mobile Number"
                      type="tel"
                      prefix="+91"
                      value={mobile}
                      onChange={handleMobileChange}
                      required
                      pattern="\d{10}"
                      title="Mobile number must be 10 digits"
                      placeholder="9876543210"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Primary Skill *</label>
                      <select
                        value={aidmateSkill}
                        onChange={(e) => setAidmateSkill(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs bg-white font-medium"
                      >
                        <option value="Plumbing">Plumbing</option>
                        <option value="Electrical">Electrical</option>
                        <option value="House Cleaning">House Cleaning</option>
                        <option value="Carpentry">Carpentry</option>
                        <option value="Appliance Repair">Appliance Repair</option>
                        <option value="Painting">Painting</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Experience *</label>
                      <select
                        value={experienceYears}
                        onChange={(e) => setExperienceYears(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs bg-white font-medium"
                      >
                        <option value="1">1+ years</option>
                        <option value="3">3+ years</option>
                        <option value="5">5+ years</option>
                        <option value="10">10+ years</option>
                      </select>
                    </div>
                  </div>

                  {/* Trade Certificate Upload Field */}
                  <div className="bg-gray-50 border border-gray-200 rounded-2xl p-3.5 space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Trade / Skill Certificate</span>
                      </label>
                      <span className="text-[10px] text-emerald-700 bg-emerald-100 font-extrabold px-1.5 py-0.5 rounded">
                        Admin Verified
                      </span>
                    </div>

                    <div>
                      <select
                        value={certificateType}
                        onChange={(e) => setCertificateType(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 text-[11px] bg-white text-gray-700 focus:outline-none"
                      >
                        <option value="Trade Certificate / ITI / Government Certification">Govt / ITI Trade Certificate</option>
                        <option value="Apprenticeship / Vocational Diploma">Vocational / Apprenticeship Diploma</option>
                        <option value="Employer Experience Letter">Prior Employer Experience Letter</option>
                        <option value="Self-Attested Skill Statement">Trade License / Registration Card</option>
                      </select>
                    </div>

                    {certificateFile ? (
                      <div className="bg-white border border-emerald-200 rounded-xl p-2.5 flex items-center justify-between">
                        <div className="flex items-center gap-2 overflow-hidden">
                          <FileCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                          <div className="truncate">
                            <p className="text-xs font-bold text-gray-800 truncate">{certificateName}</p>
                            <p className="text-[10px] text-gray-400">Ready for admin verification</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={removeCertificate}
                          className="p-1 rounded-full text-gray-400 hover:text-red-500 hover:bg-gray-100 transition-colors"
                          title="Remove Certificate"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div>
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleCertificateUpload}
                          accept="image/*,.pdf"
                          className="hidden"
                          id="cert-upload"
                        />
                        <label
                          htmlFor="cert-upload"
                          className="border-2 border-dashed border-emerald-300 hover:border-emerald-500 bg-white rounded-xl p-3 flex flex-col items-center justify-center cursor-pointer transition-colors text-center"
                        >
                          <Upload className="w-5 h-5 text-emerald-600 mb-1" />
                          <span className="text-xs font-bold text-gray-800">Upload Certificate File</span>
                          <span className="text-[10px] text-gray-400">JPG, PNG, or PDF up to 10MB</span>
                        </label>
                      </div>
                    )}
                  </div>

                  <Button type="submit" disabled={!isFormValid} isLoading={isVerifying} className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700">
                    Submit Registration & Certificate
                  </Button>

                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={() => setAidmateMode('login')}
                      className="text-xs text-gray-500 hover:text-gray-700 font-bold"
                    >
                      Already registered? Log in with mobile &rarr;
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {activeTab === 'admin' && (
            /* SECURE ADMIN LOGIN - CREDENTIALS ARE NOT DISPLAYED ON THE PAGE */
            <form onSubmit={handleAdminSubmit} className="space-y-4">
              <div className="bg-purple-50 border border-purple-100 rounded-2xl p-3 text-xs text-purple-900 mb-2">
                <p className="font-bold flex items-center gap-1.5 text-purple-950">
                  <Shield className="w-3.5 h-3.5 text-purple-600" /> Restricted Administrator Access
                </p>
                <p className="text-[11px] text-purple-700/90 mt-0.5">
                  Sign in with authorized administrator credentials to review applications and verify AidMates.
                </p>
              </div>

              {adminError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-xl text-xs flex items-center gap-2 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{adminError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Admin Username</label>
                <input
                  type="text"
                  value={adminUsername}
                  onChange={(e) => setAdminUsername(e.target.value)}
                  placeholder="Enter admin username"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Admin Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="Enter admin password"
                    className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm font-mono"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={!isFormValid || isAdminAuthenticating}
                className="w-full py-3.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-sm shadow-md transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isAdminAuthenticating ? (
                  <span>Authenticating Admin...</span>
                ) : (
                  <>
                    <Key className="w-4 h-4" />
                    <span>Login to Admin Portal</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Bottom Security Disclaimer */}
          <div className="mt-5 pt-3 border-t border-gray-100 text-center">
            <p className="text-[11px] text-gray-400 flex items-center justify-center gap-1">
              <Lock className="w-3 h-3" />
              <span>AidMate document verification is strictly restricted to Admin</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SignUpPage;
