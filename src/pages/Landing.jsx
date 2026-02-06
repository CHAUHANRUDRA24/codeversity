import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Landing = () => {
  const navigate = useNavigate();
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const displayToast = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <div className="bg-white dark:bg-[#101222] text-slate-900 dark:text-white font-sans overflow-x-hidden antialiased">
      <div className="relative flex min-h-screen w-full flex-col">
        {/* Header */}
        <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-[#101222]/80 backdrop-blur-md">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center size-8 rounded-lg bg-blue-600/10 text-blue-600">
                <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>psychology</span>
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">IntelliHire</span>
            </div>
            <nav className="hidden md:flex items-center gap-8">
              <button className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-600 transition-colors cursor-pointer bg-transparent border-none"
                onClick={() => scrollToSection('features')}>Features</button>
              <button className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-600 transition-colors cursor-pointer bg-transparent border-none"
                onClick={() => displayToast('How it works section coming soon!')}>How it works</button>
              <button className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-600 transition-colors cursor-pointer bg-transparent border-none"
                onClick={() => displayToast('Pricing plans coming soon!')}>Pricing</button>
              <button className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-600 transition-colors cursor-pointer bg-transparent border-none"
                onClick={() => displayToast('About page coming soon!')}>About</button>
            </nav>
            <div className="flex items-center gap-4">
              <button onClick={() => navigate('/login')}
                className="hidden sm:flex text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-600 transition-colors bg-transparent border-none cursor-pointer">
                Log in
              </button>
              <button onClick={() => displayToast('Get Started process initiated')}
                className="inline-flex h-9 items-center justify-center rounded-lg bg-blue-600 px-4 text-sm font-bold text-white shadow-sm hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-colors cursor-pointer border-none">
                Get Started
              </button>
              {/* Mobile Menu Button */}
              <button onClick={toggleMobileMenu}
                className="md:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg bg-transparent border-none cursor-pointer">
                <span className="material-symbols-outlined">menu</span>
              </button>
            </div>
          </div>
          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div id="mobile-menu"
              className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#101222]">
              <div className="space-y-1 px-4 pb-3 pt-2">
                <button onClick={() => { scrollToSection('features'); toggleMobileMenu(); }}
                  className="block w-full text-left rounded-md px-3 py-2 text-base font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-blue-600 cursor-pointer bg-transparent border-none">Features</button>
                <button onClick={() => { displayToast('How it works section coming soon!'); toggleMobileMenu(); }}
                  className="block w-full text-left rounded-md px-3 py-2 text-base font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-blue-600 cursor-pointer bg-transparent border-none">How it works</button>
                <button onClick={() => { displayToast('Pricing plans coming soon!'); toggleMobileMenu(); }}
                  className="block w-full text-left rounded-md px-3 py-2 text-base font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-blue-600 cursor-pointer bg-transparent border-none">Pricing</button>
                <button onClick={() => { displayToast('About page coming soon!'); toggleMobileMenu(); }}
                  className="block w-full text-left rounded-md px-3 py-2 text-base font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-blue-600 cursor-pointer bg-transparent border-none">About</button>
                <div className="mt-4 flex flex-col gap-2">
                  <button onClick={() => { navigate('/login'); toggleMobileMenu(); }}
                    className="w-full text-center rounded-lg px-3 py-2 text-base font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 bg-transparent border-none cursor-pointer">Log in</button>
                  <button onClick={() => { displayToast('Get Started process initiated'); toggleMobileMenu(); }}
                    className="w-full text-center rounded-lg bg-blue-600 px-3 py-2 text-base font-bold text-white shadow-sm hover:bg-blue-700 border-none cursor-pointer">Get Started</button>
                </div>
              </div>
            </div>
          )}
        </header>

        <main className="flex-grow">
          {/* Hero Section */}
          <section className="relative overflow-hidden pt-16 md:pt-24 lg:pt-32 pb-16">
            <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-blue-600/10 blur-3xl dark:bg-blue-600/20"></div>
            <div className="absolute top-1/2 -left-24 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl dark:bg-indigo-500/20"></div>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
              <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
                <div className="max-w-2xl text-left">
                  <div className="inline-flex items-center rounded-full border border-blue-600/20 bg-blue-600/5 px-3 py-1 text-xs font-medium text-blue-600 mb-6">
                    <span className="flex h-2 w-2 rounded-full bg-blue-600 mr-2 animate-pulse"></span>
                    New: AI Code Analysis v2.0
                  </div>
                  <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-5xl md:text-6xl lg:leading-[1.1]">
                    Hire Smarter with <br />
                    <span className="bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">AI-Powered</span> Skill Assessments
                  </h1>
                  <p className="mt-6 text-lg leading-8 text-slate-600 dark:text-slate-400 max-w-lg">
                    Stop sifting through resumes. Let our AI analyze Job Descriptions, generate custom tests, and rank candidates based on real skills, not keywords.
                  </p>
                  <div className="mt-8 flex flex-col sm:flex-row gap-4">
                    <button onClick={() => navigate('/login')}
                      className="inline-flex h-12 items-center justify-center rounded-lg bg-blue-600 px-6 text-base font-bold text-white shadow-lg shadow-blue-600/25 hover:bg-blue-700 transition-all hover:-translate-y-0.5 border-none cursor-pointer">
                      Recruiter Login
                    </button>
                    <button onClick={() => navigate('/login')}
                      className="inline-flex h-12 items-center justify-center rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-transparent px-6 text-base font-bold text-slate-900 dark:text-white hover:border-blue-600 hover:text-blue-600 dark:hover:border-blue-600 dark:hover:text-blue-600 transition-all hover:-translate-y-0.5 cursor-pointer">
                      Candidate Login
                    </button>
                  </div>
                  <div className="mt-8 flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                    <div className="flex -space-x-2">
                       <div className="h-8 w-8 rounded-full border-2 border-white dark:border-[#101222] bg-slate-200 bg-cover bg-center" style={{ backgroundImage: "url('https://i.pravatar.cc/150?img=32')" }}></div>
                       <div className="h-8 w-8 rounded-full border-2 border-white dark:border-[#101222] bg-slate-200 bg-cover bg-center" style={{ backgroundImage: "url('https://i.pravatar.cc/150?img=12')" }}></div>
                       <div className="h-8 w-8 rounded-full border-2 border-white dark:border-[#101222] bg-slate-200 bg-cover bg-center" style={{ backgroundImage: "url('https://i.pravatar.cc/150?img=5')" }}></div>
                    </div>
                    <p>Trusted by 10,000+ hiring managers</p>
                  </div>
                </div>
                <div className="relative lg:h-full flex items-center justify-center">
                  <div className="relative w-full aspect-square max-w-md lg:max-w-full rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-white to-slate-100 dark:from-slate-800 dark:to-[#101222] border border-slate-200 dark:border-slate-800">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=1000&q=80')] bg-cover bg-center opacity-80"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-[#f6f6f8] dark:from-[#101222] via-transparent to-transparent"></div>
                    <div className="absolute bottom-8 left-8 right-8 bg-white dark:bg-[#1e2030] rounded-xl p-4 shadow-xl border border-slate-100 dark:border-slate-700 backdrop-blur-sm bg-opacity-90 dark:bg-opacity-90">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="h-10 w-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                          <span className="material-symbols-outlined">check_circle</span>
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-900 dark:text-white">Candidate Match: 98%</div>
                          <div className="text-xs text-slate-500">Based on Python &amp; System Design skills</div>
                        </div>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: '98%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section id="features" className="py-20 bg-white dark:bg-[#1e2030]/50">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="text-center max-w-3xl mx-auto mb-16">
                <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl mb-4">Why Choose IntelliHire?</h2>
                <p className="text-lg text-slate-600 dark:text-slate-400">Streamline your hiring process with our advanced AI tools designed to find the best talent faster.</p>
              </div>
              <div className="grid md:grid-cols-3 gap-8">
                {/* Feature 1 */}
                <div className="group relative bg-[#f6f6f8] dark:bg-[#1e2030] rounded-xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <span className="material-symbols-outlined text-8xl text-blue-600">description</span>
                  </div>
                  <div className="inline-flex items-center justify-center h-12 w-12 rounded-lg bg-blue-600/10 text-blue-600 mb-6 group-hover:scale-110 transition-transform duration-300">
                    <span className="material-symbols-outlined">text_snippet</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Smart JD Analysis</h3>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">Upload any Job Description and let our engine extract key technical requirements instantly to build the perfect test profile.</p>
                </div>
                {/* Feature 2 */}
                <div className="group relative bg-[#f6f6f8] dark:bg-[#1e2030] rounded-xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <span className="material-symbols-outlined text-8xl text-blue-600">psychology</span>
                  </div>
                  <div className="inline-flex items-center justify-center h-12 w-12 rounded-lg bg-blue-600/10 text-blue-600 mb-6 group-hover:scale-110 transition-transform duration-300">
                    <span className="material-symbols-outlined">auto_awesome</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">AI Assessment Gen</h3>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">Automatically generate coding challenges, multiple choice quizzes, and system design tasks tailored specifically to the role.</p>
                </div>
                {/* Feature 3 */}
                <div className="group relative bg-[#f6f6f8] dark:bg-[#1e2030] rounded-xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                   <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <span className="material-symbols-outlined text-8xl text-blue-600">leaderboard</span>
                  </div>
                  <div className="inline-flex items-center justify-center h-12 w-12 rounded-lg bg-blue-600/10 text-blue-600 mb-6 group-hover:scale-110 transition-transform duration-300">
                    <span className="material-symbols-outlined">trophy</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Skill-Based Ranking</h3>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">Get a live leaderboard of candidates ranked by actual performance and code quality, reducing bias and saving screening time.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Integration Banner */}
          <section className="py-16 border-t border-slate-200 dark:border-slate-800">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-8">Seamless integration with your favorite tools</p>
              <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                 <span className="text-xl font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2"><span className="material-symbols-outlined">work</span> Greenhouse</span>
                 <span className="text-xl font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2"><span className="material-symbols-outlined">hub</span> Lever</span>
                 <span className="text-xl font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2"><span className="material-symbols-outlined">cloud_circle</span> Workday</span>
                 <span className="text-xl font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2"><span className="material-symbols-outlined">chat</span> Slack</span>
                 <span className="text-xl font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2"><span className="material-symbols-outlined">api</span> Zapier</span>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
             <div className="absolute inset-0 bg-blue-600/5 dark:bg-blue-600/10 -skew-y-2 transform origin-top-left"></div>
             <div className="mx-auto max-w-4xl relative z-10 text-center">
               <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl mb-6">Ready to transform your hiring pipeline?</h2>
               <p className="text-lg text-slate-600 dark:text-slate-300 mb-10 max-w-2xl mx-auto">Join thousands of forward-thinking companies using IntelliHire to build world-class engineering teams.</p>
               <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <button onClick={() => displayToast('Free Trial Signup')}
                     className="inline-flex h-12 items-center justify-center rounded-lg bg-blue-600 px-8 text-base font-bold text-white shadow-lg hover:bg-blue-700 transition-all hover:-translate-y-0.5 border-none cursor-pointer">
                     Start Free Trial
                  </button>
                  <button onClick={() => displayToast('Demo Schedule Calendar')}
                     className="inline-flex h-12 items-center justify-center rounded-lg bg-white dark:bg-slate-800 px-8 text-base font-bold text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-all hover:-translate-y-0.5 cursor-pointer">
                     Schedule Demo
                  </button>
               </div>
             </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="bg-white dark:bg-[#101222] border-t border-slate-200 dark:border-slate-800 pt-16 pb-8">
           <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-12">
                 <div className="col-span-2 lg:col-span-2">
                    <div className="flex items-center gap-2 mb-4">
                       <div className="flex items-center justify-center size-6 rounded bg-blue-600/10 text-blue-600">
                          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>psychology</span>
                       </div>
                       <span className="text-lg font-bold text-slate-900 dark:text-white">IntelliHire</span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xs mb-6">
                       The smartest way to assess technical talent. AI-driven, unbiased, and efficient hiring for the modern world.
                    </p>
                    <div className="flex gap-4">
                       <a href="#" className="text-slate-400 hover:text-blue-600 transition-colors">
                          <span className="sr-only">Twitter</span>
                          <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path></svg>
                       </a>
                       <a href="#" className="text-slate-400 hover:text-blue-600 transition-colors">
                          <span className="sr-only">GitHub</span>
                          <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" fillRule="evenodd"></path></svg>
                       </a>
                       <a href="#" className="text-slate-400 hover:text-blue-600 transition-colors">
                          <span className="sr-only">LinkedIn</span>
                          <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"></path></svg>
                       </a>
                    </div>
                 </div>
                 {/* Links columns */}
                 {/* ... (simplified for brevity, but I will include them to match design) */}
                 <div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-4">Product</h3>
                    <ul className="space-y-3">
                       <li><a className="text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-600" href="#">Features</a></li>
                       <li><a className="text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-600" href="#">Pricing</a></li>
                       <li><a className="text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-600" href="#">Test Library</a></li>
                       <li><a className="text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-600" href="#">Integrations</a></li>
                    </ul>
                 </div>
                 <div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-4">Resources</h3>
                    <ul className="space-y-3">
                       <li><a className="text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-600" href="#">Blog</a></li>
                       <li><a className="text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-600" href="#">Help Center</a></li>
                       <li><a className="text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-600" href="#">API Docs</a></li>
                       <li><a className="text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-600" href="#">Community</a></li>
                    </ul>
                 </div>
                 <div>
                   <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-4">Company</h3>
                   <ul className="space-y-3">
                      <li><a className="text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-600" href="#">About Us</a></li>
                      <li><a className="text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-600" href="#">Careers</a></li>
                      <li><a className="text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-600" href="#">Legal</a></li>
                      <li><a className="text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-600" href="#">Contact</a></li>
                   </ul>
                </div>
              </div>
              <div className="border-t border-slate-200 dark:border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                 <p className="text-sm text-slate-500 text-center md:text-left">© 2023 IntelliHire Inc. All rights reserved.</p>
                 <div className="flex gap-6">
                    <a className="text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white" href="#">Privacy Policy</a>
                    <a className="text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white" href="#">Terms of Service</a>
                 </div>
              </div>
           </div>
        </footer>
      </div>
      
      {/* Toast Notification */}
      <div id="toast" className={`fixed bottom-4 right-4 z-50 transform transition-all duration-300 ${showToast ? 'translate-y-0 opacity-100 pointer-events-auto' : 'translate-y-20 opacity-0 pointer-events-none'}`}>
        <div className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-3 rounded-lg shadow-xl flex items-center gap-3">
           <span className="material-symbols-outlined text-green-400 dark:text-green-600">check_circle</span>
           <span className="font-medium">{toastMessage}</span>
        </div>
      </div>
    </div>
  );
};

export default Landing;
