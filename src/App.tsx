import React, { useState, useEffect, useMemo } from 'react';

import { API_BASE, apiGet, apiPost, apiDelete, apiPatch } from './api.js';

// Auto-detect backend availability
let BACKEND_AVAILABLE = false;
fetch(`${API_BASE}/health`).then(()=> { BACKEND_AVAILABLE = true; console.log('MedConnect Backend connected:', API_BASE); }).catch(()=> console.log('Backend offline - using localStorage demo mode'));


import { 
  Search, Star, MapPin, Clock, Calendar, User, Phone, 
  Stethoscope, Heart, Brain, Bone, Baby, Eye, Ear, 
  Activity, ChevronRight, ChevronLeft, X, Check, 
  CreditCard, Wallet, Banknote, LogOut, Menu, 
  LayoutDashboard, Users, FileText, DollarSign, TrendingUp,
  Video, Building2, ShieldCheck, Award, Timer, Sparkles,
  AlertCircle, Upload, File, CheckCircle2, XCircle, Clock3
} from 'lucide-react';

// Types
type Specialty = 'Cardiology' | 'Neurology' | 'Orthopedics' | 'Pediatrics' | 'Dermatology' | 'ENT' | 'General Medicine';
type AppointmentType = 'New' | 'Follow-up' | 'Video' | 'In-person';
type AppointmentStatus = 'upcoming' | 'completed' | 'cancelled' | 'pending';
type UserRole = 'patient' | 'doctor' | 'admin';

interface Doctor {
  id: string;
  name: string;
  specialty: Specialty;
  experience: number;
  rating: number;
  reviews: number;
  hospital: string;
  fee: number;
  image: string; // kept for compatibility but not used as external src
  education: string;
  about: string;
  languages: string[];
  location: string;
  availableToday: number;
}

interface Appointment {
  id: string;
  doctorId: string;
  patientEmail: string;
  patientName: string;
  date: string; // YYYY-MM-DD
  time: string; // e.g. "10:00 AM"
  status: AppointmentStatus;
  type: AppointmentType;
  age: string;
  gender: string;
  phone: string;
  problem: string;
  payment: string;
  fee: number;
}

interface User {
  email: string;
  role: UserRole;
  name: string;
}

// Mock Doctors
const DOCTORS: Doctor[] = [
  { id: 'd1', name: 'Dr. Sarah Mitchell', specialty: 'Cardiology', experience: 14, rating: 4.9, reviews: 312, hospital: 'Apollo Heart Center', fee: 1200, image: '', education: 'MD Cardiology, AIIMS Delhi', about: 'Leading cardiologist with expertise in interventional cardiology and heart failure management. 14+ years transforming cardiac care.', languages: ['English','Hindi'], location: 'Delhi', availableToday: 5 },
  { id: 'd2', name: 'Dr. Rajiv Kapoor', specialty: 'Neurology', experience: 18, rating: 4.8, reviews: 245, hospital: 'Fortis Neuro Sciences', fee: 1500, image: '', education: 'DM Neurology, PGI Chandigarh', about: 'Renowned neurologist specializing in stroke, epilepsy and neurodegenerative disorders.', languages: ['English','Hindi','Punjabi'], location: 'Mumbai', availableToday: 3 },
  { id: 'd3', name: 'Dr. Ananya Desai', specialty: 'Dermatology', experience: 9, rating: 4.9, reviews: 189, hospital: 'SkinCraft Clinic', fee: 800, image: '', education: 'MD Dermatology, KEM Mumbai', about: 'Expert in cosmetic dermatology and clinical skin disorders with international fellowships.', languages: ['English','Marathi'], location: 'Mumbai', availableToday: 7 },
  { id: 'd4', name: 'Dr. Vikram Singh', specialty: 'Orthopedics', experience: 12, rating: 4.7, reviews: 267, hospital: 'Max Bone & Joint', fee: 1000, image: '', education: 'MS Ortho, MAMC Delhi', about: 'Joint replacement specialist focused on minimally invasive knee and hip surgeries.', languages: ['English','Hindi'], location: 'Delhi', availableToday: 4 },
  { id: 'd5', name: 'Dr. Priya Nair', specialty: 'Pediatrics', experience: 11, rating: 4.9, reviews: 421, hospital: 'Rainbow Children Hospital', fee: 700, image: '', education: 'MD Pediatrics, CMC Vellore', about: 'Compassionate pediatrician dedicated to newborn care and child development.', languages: ['English','Malayalam','Hindi'], location: 'Bangalore', availableToday: 8 },
  { id: 'd6', name: 'Dr. Arjun Mehta', specialty: 'ENT', experience: 10, rating: 4.6, reviews: 156, hospital: 'ENT Care Plus', fee: 900, image: '', education: 'MS ENT, JIPMER', about: 'ENT surgeon with expertise in endoscopic sinus surgery and voice disorders.', languages: ['English','Hindi'], location: 'Hyderabad', availableToday: 2 },
  { id: 'd7', name: 'Dr. Kavita Reddy', specialty: 'General Medicine', experience: 8, rating: 4.8, reviews: 334, hospital: 'Apollo Clinics', fee: 600, image: '', education: 'MD Medicine, Osmania', about: 'Primary care physician with holistic approach to chronic disease management.', languages: ['English','Telugu'], location: 'Hyderabad', availableToday: 10 },
  { id: 'd8', name: 'Dr. Sameer Joshi', specialty: 'Cardiology', experience: 16, rating: 4.8, reviews: 298, hospital: 'Narayana Hrudayalaya', fee: 1400, image: '', education: 'DM Cardio, SCTIMST', about: 'Interventional cardiologist, 1000+ angioplasties, researcher in preventive cardiology.', languages: ['English','Kannada'], location: 'Bangalore', availableToday: 3 },
  { id: 'd9', name: 'Dr. Neha Sharma', specialty: 'Dermatology', experience: 7, rating: 4.7, reviews: 198, hospital: 'DermaGlow', fee: 850, image: '', education: 'DDVL, MAMC', about: 'Specialist in acne, hair restoration and anti-aging treatments.', languages: ['English','Hindi'], location: 'Delhi', availableToday: 6 },
  { id: 'd10', name: 'Dr. Rohan Patel', specialty: 'Orthopedics', experience: 13, rating: 4.9, reviews: 276, hospital: 'Shalby Hospitals', fee: 1100, image: '', education: 'MS Ortho, BJMC', about: 'Sports injury specialist working with national athletes.', languages: ['English','Gujarati'], location: 'Ahmedabad', availableToday: 5 },
  { id: 'd11', name: 'Dr. Lisa Fernandez', specialty: 'Pediatrics', experience: 15, rating: 4.9, reviews: 512, hospital: 'Cloudnine Hospital', fee: 900, image: '', education: 'DCH, Fellowship Neonatology', about: 'Senior neonatologist, NICU expert and lactation consultant.', languages: ['English'], location: 'Mumbai', availableToday: 4 },
  { id: 'd12', name: 'Dr. Amit Kumar', specialty: 'General Medicine', experience: 20, rating: 4.8, reviews: 623, hospital: 'Medanta - The Medicity', fee: 1200, image: '', education: 'MD Medicine, AIIMS', about: 'Veteran internist, diabetes and hypertension specialist, author of 50+ papers.', languages: ['English','Hindi'], location: 'Delhi', availableToday: 6 },
];

const SPECIALTIES = [
  { name: 'Cardiology', icon: Heart, count: 124, color: 'bg-rose-50 text-rose-600' },
  { name: 'Neurology', icon: Brain, count: 89, color: 'bg-violet-50 text-violet-600' },
  { name: 'Orthopedics', icon: Bone, count: 112, color: 'bg-amber-50 text-amber-600' },
  { name: 'Pediatrics', icon: Baby, count: 156, color: 'bg-sky-50 text-sky-600' },
  { name: 'Dermatology', icon: Eye, count: 98, color: 'bg-emerald-50 text-emerald-600' },
  { name: 'ENT', icon: Ear, count: 67, color: 'bg-orange-50 text-orange-600' },
  { name: 'General Medicine', icon: Stethoscope, count: 203, color: 'bg-teal-50 text-teal-700' },
  { name: 'All Specialties', icon: Activity, count: 849, color: 'bg-slate-50 text-slate-700' },
];

const TIME_SLOTS = {
  morning: ['08:00 AM','08:30 AM','09:00 AM','09:30 AM','10:00 AM','10:30 AM','11:00 AM','11:30 AM'],
  afternoon: ['12:00 PM','12:30 PM','01:00 PM','01:30 PM','02:00 PM','02:30 PM','03:00 PM','03:30 PM'],
  evening: ['04:00 PM','04:30 PM','05:00 PM','05:30 PM','06:00 PM','06:30 PM','07:00 PM','07:30 PM']
};

function generateDates() {
  const dates = [];
  const today = new Date();
  for(let i=0;i<7;i++){
    const d = new Date(today);
    d.setDate(today.getDate()+i);
    dates.push({
      iso: d.toISOString().split('T')[0],
      day: d.toLocaleDateString('en-US',{weekday:'short'}),
      date: d.getDate(),
      month: d.toLocaleDateString('en-US',{month:'short'}),
      isToday: i===0,
      isTomorrow: i===1
    });
  }
  return dates;
}

function DoctorAvatar({name, size=48}:{name:string,size?:number}){
  const initials = name.split(' ').filter(w=>w.startsWith('Dr.')===false).slice(0,2).map(w=>w[0]).join('').toUpperCase() || name.slice(0,2).toUpperCase();
  // deterministic color
  let hash=0; for(let i=0;i<name.length;i++) hash = name.charCodeAt(i)+((hash<<5)-hash);
  const colors = [
    'from-teal-500 to-cyan-600',
    'from-violet-500 to-indigo-600',
    'from-emerald-500 to-teal-600',
    'from-amber-500 to-orange-600',
    'from-rose-500 to-pink-600',
    'from-sky-500 to-blue-600'
  ];
  const color = colors[Math.abs(hash)%colors.length];
  return (
    <div style={{width:size, height:size}} className={`rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center text-white font-bold shrink-0 shadow-sm`}>{initials}</div>
  );
}

export default function App(){
  const [page, setPage] = useState('landing');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDoctorId, setSelectedDoctorId] = useState<string|null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login'|'signup'>('login');
  const [authRole, setAuthRole] = useState<UserRole>('patient');
  const [user, setUser] = useState<User|null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [toast, setToast] = useState<{msg:string,type:'success'|'error'|'info'}|null>(null);
  
  // Filters
  const [filters, setFilters] = useState({
    specialty: 'All',
    location: 'All',
    availability: 'All',
    rating: 0,
    feeMax: 2000
  });

  // Booking State
  const [bookingDate, setBookingDate] = useState(generateDates()[0].iso);
  const [bookingTime, setBookingTime] = useState<string|null>(null);
  const [bookingStep, setBookingStep] = useState(1); // 1 date/time, 2 form, 3 payment, 4 success
  const [bookingForm, setBookingForm] = useState({
    name: '', age: '', gender: 'Male', phone: '', problem: '', type: 'New' as AppointmentType
  });
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [lastBooked, setLastBooked] = useState<Appointment|null>(null);

  const dates = useMemo(()=>generateDates(),[]);
  const selectedDoctor = useMemo(()=> DOCTORS.find(d=>d.id===selectedDoctorId)||null, [selectedDoctorId]);

  // Load from localStorage
  useEffect(()=>{
    const savedUser = localStorage.getItem('medconnect_user');
    const savedAppts = localStorage.getItem('medconnect_appointments');
    if(savedUser) setUser(JSON.parse(savedUser));
    if(savedAppts) setAppointments(JSON.parse(savedAppts));
    else {
      // seed some appointments for demo dashboards
      const seed: Appointment[] = [
        { id:'a1', doctorId:'d1', patientEmail:'patient@demo.com', patientName:'Aarav Sharma', date: new Date().toISOString().split('T')[0], time:'10:00 AM', status:'upcoming', type:'New', age:'32', gender:'Male', phone:'9876543210', problem:'Chest pain on exertion', payment:'UPI', fee:1200 },
        { id:'a2', doctorId:'d2', patientEmail:'patient@demo.com', patientName:'Aarav Sharma', date: new Date(Date.now()-86400000*2).toISOString().split('T')[0], time:'02:00 PM', status:'completed', type:'Follow-up', age:'32', gender:'Male', phone:'9876543210', problem:'Migraine followup', payment:'Card', fee:1500 },
        { id:'a3', doctorId:'d5', patientEmail:'patient@demo.com', patientName:'Aarav Sharma', date: new Date().toISOString().split('T')[0], time:'11:30 AM', status:'pending', type:'Video', age:'32', gender:'Male', phone:'9876543210', problem:'Child fever', payment:'UPI', fee:700 },
      ];
      setAppointments(seed);
    }
  },[]);

  useEffect(()=>{
    if(user) localStorage.setItem('medconnect_user', JSON.stringify(user));
    else localStorage.removeItem('medconnect_user');
  },[user]);

  useEffect(()=>{
    localStorage.setItem('medconnect_appointments', JSON.stringify(appointments));
  },[appointments]);

  useEffect(()=>{
    if(toast){
      const t = setTimeout(()=>setToast(null), 3000);
      return ()=>clearTimeout(t);
    }
  },[toast]);

  const showToast = (msg:string, type:'success'|'error'|'info'='success') => setToast({msg,type});

  const handleLogin = (e?:React.FormEvent)=>{
    if(e) e.preventDefault();
    const form = document.getElementById('auth-form') as HTMLFormElement;
    const email = (form?.elements.namedItem('email') as HTMLInputElement)?.value || `${authRole}@demo.com`;
    const name = email.split('@')[0].replace('.',' ');
    const newUser = { email, role: authRole, name: name.split(' ').map(w=>w.charAt(0).toUpperCase()+w.slice(1)).join(' ') };
    setUser(newUser);
    setShowAuthModal(false);
    showToast(`Welcome back, ${newUser.name}`, 'success');
    if(authRole==='patient') setPage('patientDashboard');
    else if(authRole==='doctor') setPage('doctorDashboard');
    else setPage('adminDashboard');
  };

  const handleBook = ()=>{
    if(!selectedDoctor || !bookingDate || !bookingTime || !user) return;
    // prevent double booking
    const exists = appointments.find(a=>a.doctorId===selectedDoctor.id && a.date===bookingDate && a.time===bookingTime && a.status!=='cancelled');
    if(exists){
      showToast('Slot already booked, please choose another', 'error');
      return;
    }
    const newAppt: Appointment = {
      id: 'appt_'+Date.now(),
      doctorId: selectedDoctor.id,
      patientEmail: user.email,
      patientName: bookingForm.name || user.name,
      date: bookingDate,
      time: bookingTime,
      status: 'upcoming',
      type: bookingForm.type,
      age: bookingForm.age,
      gender: bookingForm.gender,
      phone: bookingForm.phone,
      problem: bookingForm.problem,
      payment: paymentMethod,
      fee: selectedDoctor.fee
    };
    setAppointments(prev=>[newAppt, ...prev]);
    setLastBooked(newAppt);
    setBookingStep(4);
    showToast('Appointment confirmed!', 'success');
  };

  const cancelAppt = (id:string)=>{
    setAppointments(prev=>prev.map(a=>a.id===id?{...a,status:'cancelled' as const}:a));
    showToast('Appointment cancelled', 'info');
  };

  const filteredDoctors = useMemo(()=>{
    return DOCTORS.filter(d=>{
      if(searchQuery){
        const q = searchQuery.toLowerCase();
        if(!d.name.toLowerCase().includes(q) && !d.specialty.toLowerCase().includes(q) && !d.hospital.toLowerCase().includes(q)) return false;
      }
      if(filters.specialty!=='All' && d.specialty!==filters.specialty) return false;
      if(filters.location!=='All' && d.location!==filters.location) return false;
      if(filters.rating>0 && d.rating < filters.rating) return false;
      if(d.fee > filters.feeMax) return false;
      return true;
    });
  },[searchQuery, filters]);

  const isSlotBooked = (doctorId:string, date:string, time:string)=>{
    return appointments.some(a=>a.doctorId===doctorId && a.date===date && a.time===time && a.status!=='cancelled');
  };

  const patientAppointments = appointments.filter(a=>a.patientEmail=== (user?.email || 'patient@demo.com'));
  const todayStr = new Date().toISOString().split('T')[0];
  const doctorTodayAppts = appointments.filter(a=>a.date===todayStr && (user?.role==='doctor' ? true : a.doctorId==='d1'));

  return (
    <div className="min-h-screen bg-[#FBFCFD] text-slate-800 antialiased selection:bg-[#0E7C8C]/20 overflow-x-hidden">

      {/* NAVBAR */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/80 border-b border-slate-200/60">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 h-[64px] flex items-center justify-between">
          <div className="flex items-center gap-8">
            <button onClick={()=>{
              if(page==='landing'){ window.scrollTo({top:0, behavior:'smooth'}); showToast('Already on home','info'); } else { setPage('landing'); window.scrollTo(0,0); }
            }} className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#0E7C8C] to-[#0A5A64] flex items-center justify-center shadow-[0_4px_12px_rgba(14,124,140,0.3)]">
                <Stethoscope className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-[19px] tracking-tight text-slate-900">MedConnect</span>
              <span className="hidden sm:inline-flex text-[10px] font-semibold tracking-widest text-white bg-[#0E7C8C] px-1.5 py-0.5 rounded ml-1">PRO</span>
            </button>

            <nav className="hidden lg:flex items-center gap-1 bg-slate-100/80 p-1 rounded-full">
              <button onClick={()=>{
                if(page==='landing'){ window.scrollTo({top:0, behavior:'smooth'}); showToast('Already on home - welcome!','info'); } else { setPage('landing'); }
              }} className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${page==='landing'?'bg-white shadow-sm text-slate-900':'text-slate-600 hover:text-slate-900'}`}>Home</button>
              <button onClick={()=>setPage('doctors')} className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${page==='doctors'?'bg-white shadow-sm text-slate-900':'text-slate-600 hover:text-slate-900'}`}>Find Doctors</button>
              <button onClick={()=>{ if(!user) setShowAuthModal(true); else if(user.role==='patient') setPage('patientDashboard'); else if(user.role==='doctor') setPage('doctorDashboard'); else setPage('adminDashboard');}} className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${page.includes('Dashboard')?'bg-white shadow-sm text-slate-900':'text-slate-600 hover:text-slate-900'}`}>Dashboard</button>
            </nav>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden md:flex items-center gap-2 bg-white border border-slate-200 rounded-full px-3 h-9 shadow-sm w-[260px]">
              <Search className="w-4 h-4 text-slate-400" />
              <input value={searchQuery} onChange={e=>{setSearchQuery(e.target.value); if(e.target.value) setPage('doctors');}} placeholder="Search doctors, specialty..." className="bg-transparent outline-none text-sm w-full placeholder:text-slate-400" />
            </div>

            {user ? (
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-2 pl-2 pr-3 py-1 rounded-full bg-slate-900 text-white">
                  <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-bold">{user.name.slice(0,1)}</div>
                  <span className="text-sm font-medium max-w-[120px] truncate">{user.name}</span>
                  <span className="text-[10px] bg-white/15 px-1.5 py-0.5 rounded-full uppercase tracking-widest">{user.role}</span>
                </div>
                <button onClick={()=>{setUser(null); setPage('landing'); showToast('Logged out','info');}} className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <button onClick={()=>{setAuthMode('login'); setShowAuthModal(true); showToast('Open login - choose role','info');}} className="hidden sm:inline-flex h-9 px-5 rounded-full text-sm font-semibold border border-slate-200 bg-white hover:bg-slate-50">Log in</button>
                <button onClick={()=>{setAuthMode('signup'); setShowAuthModal(true);}} className="h-9 px-5 rounded-full text-sm font-semibold bg-[#0E7C8C] text-white hover:bg-[#0A5A64] shadow-[0_4px_14px_rgba(14,124,140,0.3)]">Book Appointment</button>
              </>
            )}
            <button onClick={()=>setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden w-9 h-9 rounded-full bg-white border flex items-center justify-center">
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden border-t bg-white p-4 space-y-3">
            <div className="flex gap-2">
              <div className="flex-1 flex items-center gap-2 bg-slate-100 rounded-full px-3 h-10">
                <Search className="w-4 h-4 text-slate-400" />
                <input value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} placeholder="Search doctors..." className="bg-transparent outline-none text-sm w-full" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button onClick={()=>{setPage('landing'); setMobileMenuOpen(false);}} className="py-2.5 rounded-xl bg-slate-50 font-medium text-sm">Home</button>
              <button onClick={()=>{setPage('doctors'); setMobileMenuOpen(false);}} className="py-2.5 rounded-xl bg-slate-50 font-medium text-sm">Doctors</button>
              <button onClick={()=>{setPage('patientDashboard'); setMobileMenuOpen(false);}} className="py-2.5 rounded-xl bg-slate-50 font-medium text-sm">Dashboard</button>
            </div>
          </div>
        )}
      </header>

      {/* MAIN */}
      <main className="mx-auto max-w-[1280px] px-3 sm:px-6 lg:px-8 py-6 sm:py-8 overflow-x-hidden">
        {page==='landing' && (
          <div className="space-y-12 sm:space-y-16">
            {/* HERO */}
            <section className="relative overflow-hidden rounded-[24px] sm:rounded-[32px] bg-white border border-slate-200 shadow-[0_20px_80px_-20px_rgba(14,124,140,0.15)]">
              <div className="absolute inset-0 bg-[radial-gradient(60%_60%_at_10%_10%,rgba(14,124,140,0.12),transparent),radial-gradient(50%_50%_at_90%_20%,rgba(14,124,140,0.08),transparent)]" />
              <div className="relative grid lg:grid-cols-[1.1fr_0.9fr] gap-6 sm:gap-8 p-5 sm:p-10 lg:p-12 items-start">
                <div className="min-w-0 w-full">
                  <div className="inline-flex max-w-full items-center gap-2 bg-teal-50 border border-teal-100 text-teal-700 rounded-full px-3 py-1 text-[11px] sm:text-xs font-semibold mb-4 leading-tight">
                    <Sparkles className="w-3.5 h-3.5 shrink-0" /> <span className="truncate">Trusted by 2.4M+ patients • Apollo & Fortis partners</span>
                  </div>
                  <h1 className="text-[26px] sm:text-[44px] lg:text-[52px] font-bold leading-[1.05] tracking-tight text-slate-900 break-words">
                    Healthcare Made Simple — <span className="text-[#0E7C8C]">Book in 60 Seconds</span>
                  </h1>
                  <p className="mt-4 text-[15px] sm:text-[18px] leading-relaxed text-slate-600 max-w-[560px] break-words">
                    Instantly connect with 850+ verified specialists. Video or in-clinic, transparent fees, real-time slots.
                  </p>

                  <div className="mt-6 flex flex-col sm:flex-row gap-3">
                    <div className="flex-1 min-w-0 flex items-center gap-2 sm:gap-3 bg-slate-50 border border-slate-200 rounded-full px-3 sm:px-4 h-[48px] sm:h-[52px] shadow-inner">
                      <Search className="w-5 h-5 text-slate-400 shrink-0" />
                      <input value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} placeholder="Search doctors, specialty" className="flex-1 min-w-0 bg-transparent outline-none text-[14px] sm:text-[15px]" />
                      <button onClick={()=>setPage('doctors')} className="shrink-0 bg-slate-900 text-white h-8 sm:h-9 px-4 sm:px-5 rounded-full text-sm font-semibold">Search</button>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-2 sm:gap-3 text-sm max-w-full">
                    {[
                      {k:'2.4M+', v:'Patients'},
                      {k:'850+', v:'Doctors'},
                      {k:'4.8/5', v:'Avg Rating'},
                      {k:'<60s', v:'Avg Booking'}
                    ].map(s=>(
                      <div key={s.k} className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-full px-3 py-1.5 sm:px-4 sm:py-2 shadow-sm text-xs sm:text-sm">
                        <span className="font-bold text-slate-900">{s.k}</span>
                        <span className="text-slate-500">{s.v}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 max-w-[520px]">
                    {[
                      {title:'Find Doctor', desc:'Choose specialty & location', icon: Stethoscope},
                      {title:'Pick Slot', desc:'Real-time availability', icon: Clock3},
                      {title:'Consult', desc:'Video or in-clinic', icon: Video},
                    ].map((step,i)=>(
                      <div key={i} className="rounded-2xl bg-white border border-slate-200 p-4">
                        <div className="w-8 h-8 rounded-xl bg-[#0E7C8C] text-white flex items-center justify-center mb-2"><step.icon className="w-4 h-4" /></div>
                        <div className="text-[12px] font-bold uppercase tracking-widest text-slate-400">Step {i+1}</div>
                        <div className="font-semibold text-slate-900">{step.title}</div>
                        <div className="text-xs text-slate-500 mt-1">{step.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="relative lg:pl-8 w-full max-w-[420px] mx-auto lg:mx-0 min-w-0">
                  <div className="rounded-[24px] bg-gradient-to-br from-slate-900 to-slate-800 p-2 shadow-2xl">
                    <div className="rounded-[18px] bg-white overflow-hidden">
                      <div className="p-4 flex items-center justify-between border-b">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                          <span className="text-xs font-semibold tracking-widest uppercase">Live Slots</span>
                        </div>
                        <span className="text-xs text-slate-500">Delhi • Today</span>
                      </div>
                      <div className="p-3 space-y-2 max-h-[380px] overflow-auto">
                        {DOCTORS.slice(0,5).map(d=>(
                          <div key={d.id} className="flex items-center gap-2 sm:gap-3 p-2 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 min-w-0">
                            <div className="shrink-0"><DoctorAvatar name={d.name} size={40} /></div>
                            <div className="flex-1 min-w-0 overflow-hidden">
                              <div className="font-semibold text-[13px] sm:text-sm truncate">{d.name}</div>
                              <div className="text-[11px] sm:text-xs text-slate-500 truncate">{d.specialty} • {d.hospital}</div>
                            </div>
                            <div className="text-right shrink-0">
                              <div className="text-[11px] sm:text-xs font-bold">₹{d.fee}</div>
                              <div className="text-[11px] text-emerald-600 font-medium">{d.availableToday} slots</div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="p-3 bg-slate-50 border-t flex items-center justify-between gap-2">
                        <div className="text-[11px] sm:text-xs text-slate-600 truncate">Next: <span className="font-semibold text-slate-900">Today 4:30 PM</span></div>
                        <button onClick={()=>setPage('doctors')} className="shrink-0 text-xs font-semibold bg-white border px-3 py-1.5 rounded-full">View all</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Specialties */}
            <section>
              <div className="flex items-end justify-between mb-5">
                <div>
                  <h2 className="text-[24px] sm:text-[28px] font-bold tracking-tight">Featured Specialties</h2>
                  <p className="text-slate-500 text-sm mt-1">Choose from 7+ specialties, 800+ experts</p>
                </div>
                <button onClick={()=>setPage('doctors')} className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold">Explore all <ChevronRight className="w-4 h-4" /></button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
                {SPECIALTIES.map(s=>{
                  const Icon = s.icon;
                  return (
                    <button key={s.name} onClick={()=>{setFilters(f=>({...f, specialty: s.name==='All Specialties'?'All': s.name})); setPage('doctors');}} className="group text-left rounded-2xl bg-white border border-slate-200 p-4 hover:shadow-lg hover:border-slate-300 transition">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.color} mb-3`}><Icon className="w-5 h-5" /></div>
                      <div className="font-semibold text-sm leading-tight">{s.name}</div>
                      <div className="text-xs text-slate-500 mt-1">{s.count} doctors</div>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* How it works */}
            <section className="rounded-[24px] bg-slate-900 text-white p-6 sm:p-10">
              <div className="grid lg:grid-cols-3 gap-8 items-center">
                <div className="lg:col-span-1">
                  <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-3 py-1 text-xs font-semibold mb-3"><Timer className="w-3.5 h-3.5" /> How it works</div>
                  <h2 className="text-[28px] font-bold leading-tight">From search to consultation in 3 steps</h2>
                  <p className="text-white/70 mt-3 text-sm">No calls, no queues. Real slots, instant confirmation, digital prescriptions.</p>
                </div>
                <div className="lg:col-span-2 grid sm:grid-cols-3 gap-3">
                  {[
                    {t:'Discover & Compare', d:'Verified profiles, fees, ratings, real availability.', n:'01'},
                    {t:'Lock Your Slot', d:'Pick date & time, pay via UPI/Card/Cash at clinic.', n:'02'},
                    {t:'Consult & Track', d:'Get reminders, e-prescription, bills in dashboard.', n:'03'},
                  ].map(c=>(
                    <div key={c.n} className="rounded-2xl bg-white/10 border border-white/10 p-5">
                      <div className="text-[36px] font-bold opacity-20">{c.n}</div>
                      <div className="font-semibold mt-1">{c.t}</div>
                      <div className="text-sm text-white/70 mt-1">{c.d}</div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* CTA */}
            <section className="rounded-[24px] border border-teal-100 bg-gradient-to-br from-teal-50 to-white p-8 flex flex-col lg:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#0E7C8C] text-white flex items-center justify-center"><Award className="w-6 h-6" /></div>
                <div>
                  <div className="font-bold text-lg">Are you a doctor? Join MedConnect</div>
                  <div className="text-sm text-slate-600">Get 3x more patients, manage clinic digitally, zero commission for 3 months.</div>
                </div>
              </div>
              <button onClick={()=>{setAuthRole('doctor'); setShowAuthModal(true);}} className="h-11 px-6 rounded-full bg-slate-900 text-white font-semibold">Join as Doctor</button>
            </section>
          </div>
        )}

        {page==='doctors' && (
          <div className="grid lg:grid-cols-[300px_1fr] gap-6 items-start">
            {/* Filters */}
            <div className="lg:sticky lg:top-[80px] rounded-[20px] bg-white border border-slate-200 p-5 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-bold">Filters</h3>
                <button onClick={()=>setFilters({specialty:'All', location:'All', availability:'All', rating:0, feeMax:2000})} className="text-xs font-semibold text-[#0E7C8C]">Clear all</button>
              </div>

              <div>
                <div className="text-xs font-semibold tracking-widest uppercase text-slate-500 mb-2">Specialty</div>
                <div className="flex flex-wrap gap-2">
                  {['All','Cardiology','Neurology','Orthopedics','Pediatrics','Dermatology','ENT','General Medicine'].map(s=>(
                    <button key={s} onClick={()=>setFilters(f=>({...f, specialty:s}))} className={`px-3 py-1.5 rounded-full text-sm border ${filters.specialty===s?'bg-[#0E7C8C] text-white border-[#0E7C8C]':'bg-white border-slate-200 hover:border-slate-300'}`}>{s}</button>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-xs font-semibold tracking-widest uppercase text-slate-500 mb-2">Location</div>
                <select value={filters.location} onChange={e=>setFilters(f=>({...f, location:e.target.value}))} className="w-full h-10 rounded-full border border-slate-200 px-4 bg-white text-sm">
                  <option value="All">All Cities</option>
                  <option>Delhi</option>
                  <option>Mumbai</option>
                  <option>Bangalore</option>
                  <option>Hyderabad</option>
                  <option>Ahmedabad</option>
                </select>
              </div>

              <div>
                <div className="text-xs font-semibold tracking-widest uppercase text-slate-500 mb-2">Minimum Rating</div>
                <div className="flex gap-2">
                  {[0,4,4.5,4.8].map(r=>(
                    <button key={r} onClick={()=>setFilters(f=>({...f, rating:r}))} className={`flex-1 h-9 rounded-full text-sm border font-medium ${filters.rating===r?'bg-slate-900 text-white border-slate-900':'bg-white border-slate-200'}`}>{r===0?'Any':`${r}+`}</button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs font-semibold tracking-widest uppercase text-slate-500">Max Fee</div>
                  <div className="text-sm font-semibold">₹{filters.feeMax}</div>
                </div>
                <input type="range" min={500} max={2000} step={100} value={filters.feeMax} onChange={e=>setFilters(f=>({...f, feeMax: Number(e.target.value)}))} className="w-full accent-[#0E7C8C]" />
              </div>

              <div className="pt-2 border-t text-xs text-slate-500 flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-emerald-600" /> 100% verified doctors</div>
            </div>

            {/* Doctor Grid */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">{filteredDoctors.length} doctors available</h2>
                <div className="hidden sm:flex items-center gap-2 text-xs">
                  <span className="text-slate-500">Sort:</span>
                  <select className="h-8 rounded-full border border-slate-200 bg-white px-3 text-sm">
                    <option>Recommended</option>
                    <option>Rating</option>
                    <option>Experience</option>
                    <option>Fee: Low to High</option>
                  </select>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredDoctors.map(d=>{
                  const bookedSlots = appointments.filter(a=>a.doctorId===d.id && a.date===todayStr && a.status!=='cancelled').length;
                  const remaining = Math.max(0, d.availableToday - bookedSlots);
                  return (
                    <div key={d.id} className="group rounded-[20px] bg-white border border-slate-200 p-4 hover:shadow-xl hover:border-slate-300 transition flex flex-col">
                      <div className="flex gap-3">
                        <DoctorAvatar name={d.name} size={64} />
                        <div className="flex-1 min-w-0">
                          <div className="font-bold leading-tight truncate">{d.name}</div>
                          <div className="text-xs text-[#0E7C8C] font-semibold mt-0.5">{d.specialty} • {d.experience} yrs</div>
                          <div className="flex items-center gap-1 mt-1">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            <span className="text-xs font-semibold">{d.rating}</span>
                            <span className="text-xs text-slate-500">({d.reviews})</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold">₹{d.fee}</div>
                          <div className="text-[10px] text-slate-500">consultation</div>
                        </div>
                      </div>

                      <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-600">
                        <Building2 className="w-3.5 h-3.5" /> <span className="truncate">{d.hospital}</span>
                      </div>
                      <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-600">
                        <MapPin className="w-3.5 h-3.5" /> {d.location} • {d.languages[0]}
                      </div>

                      <div className="mt-3 flex items-center gap-2">
                        <div className={`h-7 px-2.5 rounded-full text-xs font-semibold flex items-center gap-1 ${remaining>0?'bg-emerald-50 text-emerald-700 border border-emerald-200':'bg-slate-100 text-slate-500 border'}`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${remaining>0?'bg-emerald-500':'bg-slate-400'}`} /> {remaining>0?`${remaining} slots today`:'Fully booked'}
                        </div>
                        <div className="text-[11px] text-slate-500 ml-auto">{d.education.split(',')[0]}</div>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-2">
                        <button onClick={()=>{setSelectedDoctorId(d.id); setPage('doctorProfile'); setBookingStep(1); setBookingTime(null); window.scrollTo(0,0);}} className="h-10 rounded-full bg-white border border-slate-200 font-semibold text-sm hover:bg-slate-50">View Profile</button>
                        <button onClick={()=>{setSelectedDoctorId(d.id); setPage('doctorProfile'); setBookingStep(1); window.scrollTo(0,0);}} className="h-10 rounded-full bg-[#0E7C8C] text-white font-semibold text-sm hover:bg-[#0A5A64]">Book Now</button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {filteredDoctors.length===0 && (
                <div className="rounded-[20px] bg-white border border-dashed border-slate-300 p-10 text-center">
                  <AlertCircle className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                  <div className="font-semibold">No doctors found</div>
                  <div className="text-sm text-slate-500">Try adjusting filters or search</div>
                </div>
              )}
            </div>
          </div>
        )}

        {page==='doctorProfile' && selectedDoctor && (
          <div className="grid lg:grid-cols-[1fr_380px] gap-6 items-start">
            <div className="space-y-6">
              <button onClick={()=>setPage('doctors')} className="inline-flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-slate-900"><ChevronLeft className="w-4 h-4" /> Back to doctors</button>

              <div className="rounded-[24px] bg-white border border-slate-200 p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row gap-6">
                  <DoctorAvatar name={selectedDoctor.name} size={96} />
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <h1 className="text-[22px] font-bold">{selectedDoctor.name}</h1>
                      <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full text-xs font-semibold"><CheckCircle2 className="w-3.5 h-3.5" /> Verified</span>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-sm">
                      <span className="font-semibold text-[#0E7C8C]">{selectedDoctor.specialty}</span>
                      <span className="text-slate-300">•</span>
                      <span>{selectedDoctor.experience} years experience</span>
                      <span className="flex items-center gap-1"><Star className="w-4 h-4 fill-amber-400 text-amber-400" /> {selectedDoctor.rating} ({selectedDoctor.reviews} reviews)</span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="inline-flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-full px-3 py-1.5 text-xs"><Building2 className="w-3.5 h-3.5" /> {selectedDoctor.hospital}</span>
                      <span className="inline-flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-full px-3 py-1.5 text-xs"><MapPin className="w-3.5 h-3.5" /> {selectedDoctor.location}</span>
                      <span className="inline-flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-full px-3 py-1.5 text-xs"><Clock className="w-3.5 h-3.5" /> {selectedDoctor.availableToday} slots today</span>
                    </div>
                    <p className="mt-4 text-sm leading-relaxed text-slate-600">{selectedDoctor.about}</p>
                  </div>
                </div>

                <div className="mt-8 grid sm:grid-cols-3 gap-4">
                  <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
                    <div className="text-xs uppercase tracking-widest font-semibold text-slate-500">Education</div>
                    <div className="font-semibold text-sm mt-1">{selectedDoctor.education}</div>
                  </div>
                  <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
                    <div className="text-xs uppercase tracking-widest font-semibold text-slate-500">Languages</div>
                    <div className="font-semibold text-sm mt-1">{selectedDoctor.languages.join(', ')}</div>
                  </div>
                  <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
                    <div className="text-xs uppercase tracking-widest font-semibold text-slate-500">Consultation Fee</div>
                    <div className="font-bold text-lg mt-1">₹{selectedDoctor.fee} <span className="text-xs font-normal text-slate-500">/ 30 mins</span></div>
                  </div>
                </div>

                <div className="mt-8">
                  <h3 className="font-bold mb-3">Patient Reviews</h3>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {[
                      {n:'Rahul S.', r:5, t:'Extremely thorough and empathetic. Explained everything clearly.'},
                      {n:'Priya M.', r:5, t:'Best cardiologist in Delhi. My father recovered so well under her care.'},
                      {n:'Amit K.', r:4, t:'On-time, professional, great follow-up via app.'},
                    ].map((rev,i)=>(
                      <div key={i} className="rounded-2xl border border-slate-200 p-4 bg-white">
                        <div className="flex items-center gap-2">
                          <div className="flex">{Array.from({length:rev.r}).map((_,j)=><Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />)}</div>
                          <span className="text-sm font-semibold">{rev.n}</span>
                        </div>
                        <div className="text-sm text-slate-600 mt-2">"{rev.t}"</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Booking Panel */}
            <div className="lg:sticky lg:top-[80px] rounded-[24px] bg-white border border-slate-200 shadow-xl overflow-hidden">
              <div className="p-5 border-b flex items-center justify-between">
                <div>
                  <div className="font-bold">Book Appointment</div>
                  <div className="text-xs text-slate-500">₹{selectedDoctor.fee} • 30 min • {bookingForm.type}</div>
                </div>
                <div className="flex items-center gap-1">
                  {[1,2,3,4].map(s=>(
                    <div key={s} className={`w-2 h-2 rounded-full ${bookingStep>=s?'bg-[#0E7C8C]':'bg-slate-200'}`} />
                  ))}
                </div>
              </div>

              {bookingStep===1 && (
                <div className="p-5 space-y-5">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-2">Select Date</div>
                    <div className="grid grid-cols-4 sm:grid-cols-7 lg:grid-cols-4 xl:grid-cols-7 gap-2">
                      {dates.map(d=>(
                        <button key={d.iso} onClick={()=>setBookingDate(d.iso)} className={`rounded-2xl border p-2.5 text-center ${bookingDate===d.iso?'bg-[#0E7C8C] text-white border-[#0E7C8C] shadow-lg':'bg-white border-slate-200 hover:border-slate-300'}`}>
                          <div className="text-[11px] font-semibold uppercase">{d.day}</div>
                          <div className="text-[18px] font-bold leading-none mt-1">{d.date}</div>
                          <div className="text-[10px] mt-1 opacity-80">{d.month}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {(['morning','afternoon','evening'] as const).map(period=>(
                    <div key={period}>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="text-xs font-semibold uppercase tracking-widest text-slate-500">{period}</div>
                        <div className="h-px flex-1 bg-slate-100" />
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {TIME_SLOTS[period].map(time=>{
                          const booked = isSlotBooked(selectedDoctor.id, bookingDate, time);
                          const isSelected = bookingTime===time;
                          return (
                            <button key={time} disabled={booked} onClick={()=>setBookingTime(time)} className={`h-9 rounded-full text-xs font-semibold border ${booked?'bg-slate-100 text-slate-400 border-slate-100 cursor-not-allowed line-through': isSelected?'bg-slate-900 text-white border-slate-900':'bg-white border-slate-200 hover:border-slate-900'}`}>
                              {time}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}

                  <div className="flex gap-2 pt-2">
                    <div className="flex items-center gap-1.5 text-[11px]"><div className="w-3 h-3 rounded-full bg-white border border-slate-900" /> Available</div>
                    <div className="flex items-center gap-1.5 text-[11px]"><div className="w-3 h-3 rounded-full bg-slate-900" /> Selected</div>
                    <div className="flex items-center gap-1.5 text-[11px]"><div className="w-3 h-3 rounded-full bg-slate-100" /> Booked</div>
                  </div>

                  <button disabled={!bookingTime} onClick={()=>setBookingStep(2)} className="w-full h-11 rounded-full bg-[#0E7C8C] text-white font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#0A5A64]">Continue • {bookingTime||'Select time'}</button>
                </div>
              )}

              {bookingStep===2 && (
                <div className="p-5 space-y-4">
                  <div className="rounded-2xl bg-slate-50 border border-slate-200 p-3 flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2"><Calendar className="w-4 h-4" /> {bookingDate} • {bookingTime}</span>
                    <button onClick={()=>setBookingStep(1)} className="text-xs font-semibold text-[#0E7C8C]">Change</button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold">Patient Name</label>
                      <input value={bookingForm.name} onChange={e=>setBookingForm({...bookingForm, name:e.target.value})} placeholder="Full name" className="mt-1 w-full h-10 rounded-full border border-slate-200 px-4 text-sm outline-none focus:border-[#0E7C8C]" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold">Age</label>
                      <input value={bookingForm.age} onChange={e=>setBookingForm({...bookingForm, age:e.target.value})} placeholder="e.g. 32" className="mt-1 w-full h-10 rounded-full border border-slate-200 px-4 text-sm outline-none focus:border-[#0E7C8C]" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold">Gender</label>
                      <select value={bookingForm.gender} onChange={e=>setBookingForm({...bookingForm, gender:e.target.value})} className="mt-1 w-full h-10 rounded-full border border-slate-200 px-4 text-sm bg-white">
                        <option>Male</option><option>Female</option><option>Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold">Phone</label>
                      <input value={bookingForm.phone} onChange={e=>setBookingForm({...bookingForm, phone:e.target.value})} placeholder="+91..." className="mt-1 w-full h-10 rounded-full border border-slate-200 px-4 text-sm outline-none focus:border-[#0E7C8C]" />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold">Consultation Type</label>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      {(['New','Follow-up','Video','In-person'] as AppointmentType[]).map(t=>(
                        <button key={t} onClick={()=>setBookingForm({...bookingForm, type:t})} className={`h-10 rounded-full border text-sm font-medium ${bookingForm.type===t?'bg-slate-900 text-white border-slate-900':'bg-white border-slate-200'}`}>{t}</button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold">Problem Description</label>
                    <textarea value={bookingForm.problem} onChange={e=>setBookingForm({...bookingForm, problem:e.target.value})} placeholder="Describe symptoms, duration..." className="mt-1 w-full min-h-[80px] rounded-2xl border border-slate-200 p-3 text-sm outline-none focus:border-[#0E7C8C]" />
                  </div>

                  <button onClick={()=>setBookingStep(3)} disabled={!bookingForm.name || !bookingForm.phone} className="w-full h-11 rounded-full bg-[#0E7C8C] text-white font-semibold disabled:opacity-40">Continue to Payment</button>
                </div>
              )}

              {bookingStep===3 && (
                <div className="p-5 space-y-4">
                  <div className="rounded-2xl bg-slate-900 text-white p-4">
                    <div className="text-xs opacity-70">Total Amount</div>
                    <div className="text-2xl font-bold">₹{selectedDoctor.fee}</div>
                    <div className="text-xs opacity-70 mt-1">{selectedDoctor.name} • {bookingDate} {bookingTime}</div>
                  </div>

                  <div className="space-y-2">
                    {[
                      {id:'UPI', icon: Wallet, desc:'GPay, PhonePe, Paytm'},
                      {id:'Card', icon: CreditCard, desc:'Credit / Debit Card'},
                      {id:'Cash', icon: Banknote, desc:'Pay at hospital'},
                    ].map(m=>{
                      const Icon = m.icon;
                      return (
                        <button key={m.id} onClick={()=>setPaymentMethod(m.id)} className={`w-full flex items-center gap-3 p-3 rounded-2xl border text-left ${paymentMethod===m.id?'border-slate-900 bg-slate-50':'border-slate-200 bg-white'}`}>
                          <div className="w-10 h-10 rounded-xl bg-white border flex items-center justify-center"><Icon className="w-5 h-5" /></div>
                          <div className="flex-1"><div className="font-semibold text-sm">{m.id}</div><div className="text-xs text-slate-500">{m.desc}</div></div>
                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${paymentMethod===m.id?'bg-slate-900 border-slate-900':'bg-white'}`}>{paymentMethod===m.id && <Check className="w-3 h-3 text-white" />}</div>
                        </button>
                      );
                    })}
                  </div>

                  <button onClick={handleBook} className="w-full h-11 rounded-full bg-[#0E7C8C] text-white font-semibold hover:bg-[#0A5A64]">Confirm & Pay ₹{selectedDoctor.fee}</button>
                  <div className="text-[11px] text-center text-slate-500">Secure payment • Instant confirmation • Free cancellation</div>
                </div>
              )}

              {bookingStep===4 && lastBooked && (
                <div className="p-8 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto"><Check className="w-8 h-8 text-emerald-600" /></div>
                  <h3 className="text-xl font-bold">Appointment Confirmed!</h3>
                  <p className="text-sm text-slate-600">Your appointment with {selectedDoctor.name} is booked for {lastBooked.date} at {lastBooked.time}.</p>
                  <div className="rounded-2xl bg-slate-50 border p-4 text-left text-sm space-y-1">
                    <div><span className="text-slate-500">ID:</span> <span className="font-mono font-semibold">{lastBooked.id.slice(-8).toUpperCase()}</span></div>
                    <div><span className="text-slate-500">Patient:</span> {lastBooked.patientName}</div>
                    <div><span className="text-slate-500">Payment:</span> {lastBooked.payment} • ₹{lastBooked.fee}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <button onClick={()=>{setPage('patientDashboard'); setBookingStep(1);}} className="h-10 rounded-full bg-slate-900 text-white font-semibold text-sm">Go to Dashboard</button>
                    <button onClick={()=>{setPage('doctors'); setBookingStep(1); setBookingTime(null);}} className="h-10 rounded-full bg-white border font-semibold text-sm">Book Another</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {page==='patientDashboard' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="text-[24px] font-bold">Patient Dashboard</h1>
                <p className="text-sm text-slate-500">Manage appointments, records and bills</p>
              </div>
              <button onClick={()=>setPage('doctors')} className="h-10 px-5 rounded-full bg-[#0E7C8C] text-white font-semibold text-sm">+ New Appointment</button>
            </div>

            <div className="grid lg:grid-cols-[1fr_340px] gap-6 items-start">
              <div className="space-y-6">
                <div className="grid grid-cols-3 gap-3">
                  {[
                    {label:'Upcoming', value: patientAppointments.filter(a=>a.status==='upcoming').length, color:'bg-slate-900 text-white'},
                    {label:'Completed', value: patientAppointments.filter(a=>a.status==='completed').length, color:'bg-white border'},
                    {label:'Total Spent', value:`₹${patientAppointments.reduce((s,a)=>s+a.fee,0)}`, color:'bg-white border'},
                  ].map(c=>(
                    <div key={c.label} className={`rounded-[18px] p-4 ${c.color}`}>
                      <div className="text-xs uppercase tracking-widest opacity-70">{c.label}</div>
                      <div className="text-2xl font-bold mt-1">{c.value}</div>
                    </div>
                  ))}
                </div>

                <div className="rounded-[20px] bg-white border border-slate-200">
                  <div className="p-5 flex items-center justify-between border-b">
                    <h3 className="font-bold">Upcoming Appointments</h3>
                    <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full font-semibold">{patientAppointments.filter(a=>a.status==='upcoming').length} scheduled</span>
                  </div>
                  <div className="p-3 space-y-3">
                    {patientAppointments.filter(a=>a.status==='upcoming' || a.status==='pending').length===0 && (
                      <div className="py-12 text-center">
                        <Calendar className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                        <div className="font-semibold">No upcoming appointments</div>
                        <div className="text-sm text-slate-500">Book your first consultation</div>
                      </div>
                    )}
                    {patientAppointments.filter(a=>a.status==='upcoming' || a.status==='pending').map(appt=>{
                      const doc = DOCTORS.find(d=>d.id===appt.doctorId);
                      return (
                        <div key={appt.id} className="rounded-2xl border border-slate-200 p-4 flex gap-4">
                          <DoctorAvatar name={doc?.name||'Dr'} size={48} />
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold truncate">{doc?.name}</div>
                            <div className="text-xs text-slate-500">{doc?.specialty} • {appt.date} • {appt.time}</div>
                            <div className="mt-2 flex gap-2">
                              <span className={`text-[11px] px-2 py-1 rounded-full font-semibold border ${appt.status==='pending'?'bg-amber-50 text-amber-700 border-amber-200':'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>{appt.status}</span>
                              <span className="text-[11px] px-2 py-1 rounded-full bg-slate-50 border text-slate-600">{appt.type}</span>
                            </div>
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <button onClick={()=>cancelAppt(appt.id)} className="h-8 px-3 rounded-full bg-white border text-xs font-semibold">Cancel</button>
                            <button onClick={()=>showToast('Reschedule - pick new slot from doctor profile','info')} className="h-8 px-3 rounded-full bg-slate-900 text-white text-xs font-semibold">Reschedule</button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="rounded-[20px] bg-white border border-slate-200">
                  <div className="p-5 border-b font-bold">Past Appointments</div>
                  <div className="divide-y">
                    {patientAppointments.filter(a=>a.status==='completed' || a.status==='cancelled').map(appt=>{
                      const doc = DOCTORS.find(d=>d.id===appt.doctorId);
                      return (
                        <div key={appt.id} className="p-4 flex items-center gap-3 text-sm">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${appt.status==='completed'?'bg-emerald-50 text-emerald-600':'bg-slate-100 text-slate-500'}`}>{appt.status==='completed'?<CheckCircle2 className="w-4 h-4" />:<XCircle className="w-4 h-4" />}</div>
                          <div className="flex-1"><span className="font-semibold">{doc?.name}</span> <span className="text-slate-500">• {appt.date} • {appt.problem.slice(0,30)}</span></div>
                          <div className="text-xs text-slate-500">₹{appt.fee}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="rounded-[20px] bg-white border border-slate-200 p-5">
                  <h3 className="font-bold mb-3 flex items-center gap-2"><FileText className="w-4 h-4" /> Medical Records</h3>
                  <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-center">
                    <Upload className="w-6 h-6 mx-auto text-slate-400 mb-2" />
                    <div className="text-sm font-semibold">Upload reports</div>
                    <div className="text-xs text-slate-500">PDF, JPG up to 10MB</div>
                    <button onClick={()=>showToast('Upload simulated - file added to records','success')} className="mt-3 h-8 px-4 rounded-full bg-slate-900 text-white text-xs font-semibold">Choose Files</button>
                  </div>
                  <div className="mt-4 space-y-2">
                    {[
                      {name:'Blood Test - CBC', date:'12 Sep 2024'},
                      {name:'Chest X-Ray', date:'08 Aug 2024'},
                      {name:'Prescription - Dr. Mitchell', date:'10 Sep 2024'},
                    ].map(f=>(
                      <div key={f.name} className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border">
                        <div className="w-8 h-8 rounded-lg bg-white border flex items-center justify-center"><File className="w-4 h-4" /></div>
                        <div className="flex-1 min-w-0"><div className="text-xs font-semibold truncate">{f.name}</div><div className="text-[11px] text-slate-500">{f.date}</div></div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[20px] bg-slate-900 text-white p-5">
                  <h3 className="font-bold mb-3">Bills & Payments</h3>
                  <div className="space-y-2">
                    {patientAppointments.slice(0,3).map(a=>(
                      <div key={a.id} className="flex items-center justify-between text-sm bg-white/10 rounded-xl p-3">
                        <span>Consultation • {a.date}</span>
                        <span className="font-semibold">₹{a.fee}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex items-center justify-between text-sm"><span className="opacity-70">Total Paid</span><span className="font-bold text-lg">₹{patientAppointments.reduce((s,a)=>s+a.fee,0)}</span></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {page==='doctorDashboard' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-[24px] font-bold">Doctor Dashboard</h1>
                <p className="text-sm text-slate-500">Today • {new Date().toLocaleDateString('en-IN',{weekday:'long', day:'numeric', month:'long'})}</p>
              </div>
              <div className="hidden sm:flex items-center gap-2">
                <div className="h-9 px-4 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-semibold flex items-center gap-1.5"><div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" /> Online • Accepting patients</div>
              </div>
            </div>

            <div className="grid lg:grid-cols-[1fr_360px] gap-6">
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  {[
                    {label:"Today's Queue", value: doctorTodayAppts.length, sub:'patients'},
                    {label:'Completed', value: appointments.filter(a=>a.status==='completed').length, sub:'today'},
                    {label:'Earnings', value:`₹${doctorTodayAppts.reduce((s,a)=>s+a.fee,0)}`, sub:'today'},
                  ].map(c=>(
                    <div key={c.label} className="rounded-[18px] bg-white border p-4">
                      <div className="text-xs uppercase tracking-widest text-slate-500">{c.label}</div>
                      <div className="text-2xl font-bold mt-1">{c.value} <span className="text-sm font-normal text-slate-500">{c.sub}</span></div>
                    </div>
                  ))}
                </div>

                <div className="rounded-[20px] bg-white border">
                  <div className="p-5 border-b flex items-center justify-between">
                    <h3 className="font-bold">Today's Appointments Queue</h3>
                    <span className="text-xs bg-slate-900 text-white px-3 py-1 rounded-full">{doctorTodayAppts.length} patients</span>
                  </div>
                  <div className="divide-y max-h-[600px] overflow-auto">
                    {doctorTodayAppts.length===0 && <div className="p-10 text-center text-sm text-slate-500">No appointments for today</div>}
                    {doctorTodayAppts.map((appt,i)=>{
                      const isNext = i===0;
                      return (
                        <div key={appt.id} className={`p-4 flex gap-3 ${isNext?'bg-teal-50/50':''}`}>
                          <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold">{i+1}</div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2"><span className="font-semibold">{appt.patientName}</span><span className="text-xs px-2 py-0.5 rounded-full bg-white border">{appt.time}</span>{isNext && <span className="text-xs bg-[#0E7C8C] text-white px-2 py-0.5 rounded-full">NEXT</span>}</div>
                            <div className="text-xs text-slate-600 mt-1">{appt.age}y • {appt.gender} • {appt.type} • {appt.problem}</div>
                            <div className="mt-3 flex gap-2">
                              <button onClick={()=>{setAppointments(prev=>prev.map(a=>a.id===appt.id?{...a,status:'completed'}:a)); showToast('Marked completed & prescription sent','success');}} className="h-8 px-3 rounded-full bg-slate-900 text-white text-xs font-semibold">Complete + Prescribe</button>
                              <button onClick={()=>showToast('Patient notified','info')} className="h-8 px-3 rounded-full bg-white border text-xs font-semibold">View Details</button>
                            </div>
                          </div>
                          <div className="text-xs font-semibold">₹{appt.fee}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-[20px] bg-white border p-5">
                  <h3 className="font-bold mb-3">Set Availability</h3>
                  <div className="space-y-3">
                    {Object.entries(TIME_SLOTS).map(([k,v])=>(
                      <div key={k} className="flex items-center justify-between">
                        <span className="text-sm capitalize font-medium">{k}</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" defaultChecked className="sr-only peer" />
                          <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:bg-[#0E7C8C] peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition"></div>
                        </label>
                      </div>
                    ))}
                    <button onClick={()=>showToast('Availability updated','success')} className="w-full h-10 rounded-full bg-[#0E7C8C] text-white font-semibold text-sm mt-2">Save Availability</button>
                  </div>
                </div>

                <div className="rounded-[20px] bg-slate-900 text-white p-5">
                  <h3 className="font-bold">Quick Prescription</h3>
                  <p className="text-xs opacity-70 mt-1">Select patient to write e-prescription</p>
                  <textarea placeholder="Rx: Write prescription here..." className="mt-3 w-full min-h-[100px] rounded-2xl bg-white/10 border border-white/10 p-3 text-sm outline-none placeholder:text-white/40" />
                  <button onClick={()=>showToast('Prescription sent to patient','success')} className="mt-3 w-full h-10 rounded-full bg-white text-slate-900 font-semibold text-sm">Send Prescription</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {page==='adminDashboard' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-[24px] font-bold">Admin Analytics</h1>
              <div className="text-xs bg-white border px-3 py-1.5 rounded-full">Last 30 days • Live data</div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                {label:'Total Appointments', value: appointments.length, change:'+12%', icon: Calendar},
                {label:'Total Revenue', value:`₹${appointments.reduce((s,a)=>s+a.fee,0).toLocaleString()}`, change:'+8%', icon: DollarSign},
                {label:'Active Doctors', value: DOCTORS.length, change:'+3', icon: Users},
                {label:'Patients', value:'2,431', change:'+18%', icon: Activity},
              ].map(card=>{
                const Icon = card.icon;
                return (
                  <div key={card.label} className="rounded-[20px] bg-white border p-5">
                    <div className="flex items-center justify-between"><div className="w-9 h-9 rounded-xl bg-slate-50 border flex items-center justify-center"><Icon className="w-4 h-4" /></div><span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-semibold">{card.change}</span></div>
                    <div className="text-2xl font-bold mt-3">{card.value}</div>
                    <div className="text-xs text-slate-500 mt-1">{card.label}</div>
                  </div>
                );
              })}
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 rounded-[20px] bg-white border p-5">
                <h3 className="font-bold mb-4">Revenue Trend (Last 7 Days)</h3>
                <div className="flex items-end gap-2 h-[140px]">
                  {[40,65,45,80,60,90,75].map((h,i)=>(
                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full bg-slate-100 rounded-full relative overflow-hidden" style={{height:'100px'}}>
                        <div className="absolute bottom-0 w-full bg-gradient-to-t from-[#0A5A64] to-[#0E7C8C] rounded-full" style={{height:`${h}%`}} />
                      </div>
                      <span className="text-[11px] text-slate-500">{['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][i]}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-[20px] bg-white border p-5">
                <h3 className="font-bold mb-4">Specialty Distribution</h3>
                <div className="space-y-3">
                  {SPECIALTIES.slice(0,5).map(s=>{
                    const count = DOCTORS.filter(d=>d.specialty===s.name).length;
                    const pct = (count/DOCTORS.length)*100;
                    return (
                      <div key={s.name} className="flex items-center gap-3">
                        <div className="text-xs font-medium w-[90px] truncate">{s.name}</div>
                        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-[#0E7C8C]" style={{width:`${pct}%`}} /></div>
                        <div className="text-xs text-slate-500">{count}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <div className="rounded-[20px] bg-white border overflow-hidden">
                <div className="p-5 border-b flex items-center justify-between"><h3 className="font-bold">Manage Doctors</h3><button onClick={()=>showToast('Doctor invite sent','success')} className="h-8 px-3 rounded-full bg-slate-900 text-white text-xs font-semibold">+ Add Doctor</button></div>
                <div className="divide-y max-h-[340px] overflow-auto">
                  {DOCTORS.slice(0,6).map(d=>(
                    <div key={d.id} className="p-4 flex items-center gap-3">
                      <DoctorAvatar name={d.name} size={36} />
                      <div className="flex-1 min-w-0"><div className="font-semibold text-sm truncate">{d.name}</div><div className="text-xs text-slate-500 truncate">{d.specialty} • {d.hospital}</div></div>
                      <span className="text-xs px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border">Active</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[20px] bg-white border overflow-hidden">
                <div className="p-5 border-b"><h3 className="font-bold">Recent Appointments</h3></div>
                <div className="divide-y max-h-[340px] overflow-auto">
                  {appointments.slice(0,6).map(a=>{
                    const doc = DOCTORS.find(d=>d.id===a.doctorId);
                    return (
                      <div key={a.id} className="p-4 flex items-center gap-3 text-sm">
                        <div className={`w-2 h-2 rounded-full ${a.status==='upcoming'?'bg-emerald-500':a.status==='completed'?'bg-slate-400':'bg-amber-500'}`} />
                        <div className="flex-1 truncate">{a.patientName} → {doc?.name} • {a.date} {a.time}</div>
                        <div className="text-xs">₹{a.fee}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="mt-16 border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 py-10 grid sm:grid-cols-3 lg:grid-cols-5 gap-8 text-sm">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 font-bold text-[18px]"><div className="w-7 h-7 rounded-lg bg-[#0E7C8C] flex items-center justify-center text-white"><Stethoscope className="w-4 h-4" /></div> MedConnect</div>
            <p className="text-slate-500 mt-3 max-w-[320px]">India's most trusted healthcare booking platform. Verified doctors, transparent pricing, instant confirmation. Inspired by Apollo, 1mg, Practo.</p>
            <div className="mt-4 flex gap-2">
              <div className="h-8 px-3 rounded-full bg-slate-900 text-white flex items-center gap-1.5 text-xs font-semibold"><ShieldCheck className="w-4 h-4" /> NABH Certified</div>
              <div className="h-8 px-3 rounded-full bg-slate-50 border flex items-center gap-1.5 text-xs font-semibold"><Award className="w-4 h-4" /> ISO 27001</div>
            </div>
          </div>
          <div><div className="font-semibold mb-3">Product</div><div className="space-y-2 text-slate-500"><div>Find Doctors</div><div>Video Consult</div><div>Lab Tests</div><div>Medical Records</div></div></div>
          <div><div className="font-semibold mb-3">Company</div><div className="space-y-2 text-slate-500"><div>About</div><div>Careers</div><div>Press</div><div>Contact</div></div></div>
          <div><div className="font-semibold mb-3">Support</div><div className="space-y-2 text-slate-500"><div>Help Center</div><div>Privacy Policy</div><div>Terms</div><div>Refund Policy</div></div></div>
        </div>
        <div className="border-t border-slate-100 py-4 text-center text-xs text-slate-400">© 2025 MedConnect Healthcare Pvt. Ltd. • Made for production demo • All data is mock</div>
      </footer>

      {/* AUTH MODAL */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={()=>setShowAuthModal(false)} />
          <div className="relative w-full max-w-[440px] rounded-[24px] bg-white shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-6 border-b flex items-center justify-between">
              <div>
                <div className="font-bold text-[18px]">{authMode==='login'?'Welcome back':'Create account'} </div>
                <div className="text-xs text-slate-500">MedConnect • Secure & Encrypted</div>
              </div>
              <button onClick={()=>setShowAuthModal(false)} className="w-8 h-8 rounded-full bg-slate-50 border flex items-center justify-center"><X className="w-4 h-4" /></button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex gap-1 p-1 bg-slate-100 rounded-full">
                {(['patient','doctor','admin'] as UserRole[]).map(r=>(
                  <button key={r} onClick={()=>setAuthRole(r)} className={`flex-1 h-8 rounded-full text-xs font-semibold capitalize ${authRole===r?'bg-white shadow-sm text-slate-900':'text-slate-600'}`}>{r}</button>
                ))}
              </div>

              <div className="rounded-2xl bg-amber-50 border border-amber-200 p-3 text-xs">
                <div className="font-semibold">Demo Credentials</div>
                <div className="mt-1 font-mono text-[11px] leading-relaxed">
                  patient@demo.com / doctor@demo.com / admin@demo.com<br/>Password: demo123
                </div>
              </div>

              <form id="auth-form" onSubmit={handleLogin} className="space-y-3">
                <input name="name" placeholder="Full name" className={`${authMode==='login'?'hidden':''} w-full h-11 rounded-full border border-slate-200 px-4 text-sm outline-none focus:border-[#0E7C8C]`} />
                <input name="email" defaultValue={`${authRole}@demo.com`} placeholder="Email address" className="w-full h-11 rounded-full border border-slate-200 px-4 text-sm outline-none focus:border-[#0E7C8C]" />
                <input name="password" defaultValue="demo123" type="password" placeholder="Password" className="w-full h-11 rounded-full border border-slate-200 px-4 text-sm outline-none focus:border-[#0E7C8C]" />
                <button type="submit" className="w-full h-11 rounded-full bg-[#0E7C8C] text-white font-semibold hover:bg-[#0A5A64]">{authMode==='login'?'Log in':'Create account'}</button>
              </form>

              <div className="text-center text-xs text-slate-500">
                {authMode==='login'?'No account?':'Already have account?'} <button onClick={()=>setAuthMode(authMode==='login'?'signup':'login')} className="font-semibold text-slate-900 underline">{authMode==='login'?'Sign up':'Log in'}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TOAST */}
      {toast && (
        <div className="fixed bottom-6 right-6 left-6 sm:left-auto z-50">
          <div className={`mx-auto sm:mx-0 sm:ml-auto max-w-[380px] rounded-2xl border px-4 py-3 shadow-xl backdrop-blur-xl flex items-center gap-3 ${toast.type==='success'?'bg-slate-900 text-white border-slate-800': toast.type==='error'?'bg-white border-red-200 text-red-700':'bg-white border-slate-200'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${toast.type==='success'?'bg-white/10': toast.type==='error'?'bg-red-50':'bg-slate-50'}`}>
              {toast.type==='success'?<Check className="w-4 h-4" />: toast.type==='error'?<X className="w-4 h-4" />:<Clock3 className="w-4 h-4" />}
            </div>
            <div className="text-sm font-medium flex-1">{toast.msg}</div>
            <button onClick={()=>setToast(null)} className="w-6 h-6 rounded-full bg-black/10 flex items-center justify-center"><X className="w-3 h-3" /></button>
          </div>
        </div>
      )}
    </div>
  );
}
